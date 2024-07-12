import { SignalNullable } from "../../utils/SignalNullable";
import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { DataFormat } from "../DrodEnums";
import { wcharBase64ToString } from "../Utils";
import { HoldRef } from "../references/HoldReference";
import type { Hold } from "./Hold";

export interface HoldDataDetails {
	readonly format: DataFormat;
	readonly rawEncodedData: string;
}
interface DataConstructor {
	id: number;
	holdId: number;
	format: DataFormat;
	encName: string;
	encRawData?: string;
}
export class HoldData {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly holdId: number;
	public readonly name: SignalUpdatableValue<string>;

	public readonly details: SignalUpdatableValue<HoldDataDetails>;

	public readonly $replacingFile = new SignalNullable<File>();
	public readonly $lastReplaceError = new SignalNullable<string>();

	public readonly $uses: HoldRef[] = [];

	public get $size() {
		return this.details.newValue.rawEncodedData.length * 3 / 4;
	}

	public constructor(hold: Hold, opts: DataConstructor) {
		this.$hold = hold;

		this.id = opts.id;
		this.holdId = opts.holdId;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));
		this.details = new SignalUpdatableValue({
			format: opts.format,
			rawEncodedData: opts.encRawData ?? ""
		});

		if (!this.details.oldValue.rawEncodedData) {
			hold.$problems.push({
				ref: {
					hold,
					model: "data",
					dataId: this.id
				},
				problem: "No file data was given."
			})
		}
	}
}
