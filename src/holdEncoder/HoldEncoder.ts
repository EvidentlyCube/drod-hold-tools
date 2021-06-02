import {EncodeState, EncodeStep} from "./EncoderCommon";
import {Signal} from "signals";
import {Hold} from "../data/Hold";
import {getEncodeHoldChanges} from "./EncodeHoldChanges";
import {getEncodeXor} from "./EncodeXor";
import {getEncoderDeflate} from "./EncoderDeflate";
import {HoldOperator} from "../common/CommonTypes";
import {getEncoderBlobify} from "./EncodeBlobify";
import {Store} from "../data/Store";
import {getEncodeToArray} from "./EncodeToArray";

const MAX_TIME_PER_TICK = 8;

export class HoldEncoder implements HoldOperator {
	private _state: EncodeState;
	private _steps: EncodeStep[];
	private _fileName: string;

	public onUpdate: Signal;

	public get isRunning() {
		return this._steps.length > 0;
	}

	public get currentStep(): EncodeStep | undefined {
		return this._steps[0];
	}

	public get currentStepName(): string {
		return this._steps[0]?.name || "All steps finished";
	}

	public get progressFactor() {
		return this._state.progressFactor;
	}

	public get fileName() {
		return this._fileName;
	}

	public get holdBytes(): Blob {
		return this._state.holdBlob;
	}

	public get lastError() {
		return '';
	}

	constructor() {
		this._state = undefined!;
		this._steps = [];
		this._fileName = "";
		this.onUpdate = new Signal();
	}

	public startEncode(hold: Hold) {
		this._fileName = hold.name;

		this._steps = [
			getEncodeHoldChanges(),
			getEncodeToArray(),
			getEncoderDeflate(),
			getEncodeXor(),
			getEncoderBlobify(),
		];

		this._state = {
			hold: hold,
			holdXml: hold.xmlDocument,
			holdBytes: new Uint8Array(),
			holdBlob: undefined!,
			progressFactor: 0,
		};

		requestAnimationFrame(() => this.update());
	}

	private update() {
		const readUntil = Date.now() + MAX_TIME_PER_TICK;

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

		this.onUpdate.dispatch();

		if (this._steps.length) {
			requestAnimationFrame(() => this.update());
		} else {
			Store.downloadableHold.value = this._state.holdBlob;
		}
	}
}