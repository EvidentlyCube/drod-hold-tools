import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { DataFormat } from "../DrodEnums";
import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";

export interface HoldDataDetails {
	format: DataFormat;
	rawEncodedData: string;
}
interface DataConstructor {
	id: number;
	holdId: number;
	format: DataFormat;
	encName: string;
	encRawData: string;
}
export class HoldData {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly holdId: number;
	public readonly name: DrodText;

	public readonly details: SignalUpdatableValue<HoldDataDetails>;

	public get $size() {
		return this.details.finalValue.rawEncodedData.length * 3 / 4;
	}

	public constructor(hold: Hold, opts: DataConstructor) {
		this.$hold = hold;

		this.id = opts.id;
		this.holdId = opts.holdId;
		this.name = new DrodText(opts.encName);
		this.details = new SignalUpdatableValue({
			format: opts.format,
			rawEncodedData: opts.encRawData
		});
	}
}
