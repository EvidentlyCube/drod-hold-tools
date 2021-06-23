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
import {HoldOperator} from "../common/CommonTypes";
import {assert} from "../common/Assert";

const MAX_TIME_PER_TICK = 32;

export class HoldDecoder implements HoldOperator {
	private _state?: DecodeState;
	private _steps: DecodeStep[];
	private _fileName: string;
	private _lastError: string;

	public onUpdate: Signal;

	public get isRunning() {
		return this._steps.length > 0;
	}

	public get progressFactor() {
		return this._state?.progressFactor ?? -1;
	}

	public get fileName() {
		return this._fileName;
	}

	public get lastError() {
		return this._lastError;
	}

	public get currentStepName(): string {
		return this._steps[0]?.name || "All steps finished";
	}

	constructor() {
		this._state = undefined!;
		this._steps = [];
		this._fileName = "";
		this._lastError = "";
		this.onUpdate = new Signal();
	}

	public startDecode(fileOrData: File | Uint8Array, fileName: string) {
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
		const state = this._state;
		assert(state, "Hold Decoder tries to run with no state, something went wrong");

		const readUntil = Date.now() + MAX_TIME_PER_TICK;

		try {
			while (Date.now() < readUntil) {
				const step = this._steps[0];

				if (!step) {
					break;
				}

				if (step.run(state)) {
					step.after?.(state);
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
			Store.loadedHold.value = state.hold;
			this._state = undefined;
		}
	}
}