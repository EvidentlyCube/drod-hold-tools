import { DataFormat } from "../DrodEnums";
import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";

interface DataConstructor {
	id: number;
	holdId: number;
	format: DataFormat;
	encName: string;
	encRawData: string;
}
export class HoldData {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly holdId: number;
	public readonly name: DrodText;
	public readonly format: DataFormat;
	public readonly rawEncodedData: string;

	public constructor(hold: Hold, opts: DataConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.holdId = opts.holdId;
		this.name = new DrodText(opts.encName);
		this.format = opts.format;
		this.rawEncodedData = opts.encRawData;
	}
}
