import {createNullHold} from "../data/Hold";
import {DecodeState, DecodeStep} from "./DecoderCommon";
import {getDecoderReadFile} from "./DecodeReadFile";
import {getDecodeXor} from "./DecodeXor";
import {getDecodeInflate} from "./DecodeInflate";
import {getDecodeReadToXml} from "./DecodeReadToXml";
import {Signal} from "signals";
import {getDecodeToHold} from "./DecodeToHold";
import {Store} from "../data/Store";
import {getDecodeHoldLinker} from "./DecodeHoldLinker";
import {getDecodeValidateXml} from "./DecodeValidateHold";

const MAX_TIME_PER_TICK = 8;

export class HoldDecoder {
	private _state: DecodeState;
	private _steps: DecodeStep[];
	private _fileName: string;
	private _lastError: string;

	public onUpdate: Signal;

	public get isLoading() {
		return this._steps.length > 0;
	}

	public get currentStep(): DecodeStep | undefined {
		return this._steps[0];
	}

	public get progressFactor() {
		return this._state?.progressFactor ?? -1;
	}

	public get fileName() {
		return this._fileName;
	}

	public get hold() {
		return this._state.hold;
	}

	public get lastError() {
		return this._lastError;
	}

	constructor() {
		this._state = undefined!;
		this._steps = [];
		this._fileName = "";
		this._lastError = "";
		this.onUpdate = new Signal();
	}

	public startDecode(fileOrData: File|Uint8Array, fileName: string) {
		this._fileName = fileName;
		this._lastError = "";

		this._steps = [
			getDecoderReadFile(),
			getDecodeXor(),
			getDecodeInflate(),
			getDecodeReadToXml(),
			getDecodeValidateXml(),
			getDecodeToHold(),
			getDecodeHoldLinker(),
		];

		this._state = {
			file: fileOrData instanceof File ? fileOrData : undefined,
			holdBytes: fileOrData instanceof File ? new Uint8Array() : fileOrData,
			holdXml: document.implementation.createDocument(null, null),
			hold: createNullHold(),
			progressFactor: 0,
		};

		requestAnimationFrame(() => this.update());
	}

	private update() {
		const readUntil = Date.now() + MAX_TIME_PER_TICK;

		try {
			while (Date.now() < readUntil) {
				const step = this._steps[0];

				if (!step) {
					break;
				}

				if (step.run(this._state)) {
					step.after?.(this._state);
					this._steps.shift();
				}
			}
		} catch (error) {
			this._lastError = error?.message ?? "Unknown error";
			this._steps.length = 0;
			this.onUpdate.dispatch();
		}

		this.onUpdate.dispatch();

		if (this._steps.length) {
			requestAnimationFrame(() => this.update());
		} else {
			Store.loadedHold.value = this._state.hold;
		}
	}
}