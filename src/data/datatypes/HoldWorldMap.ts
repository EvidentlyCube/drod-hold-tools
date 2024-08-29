import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface Constructor {
	id: number;
	dataId?: number;
	displayType: number;
	orderIndex: number;
	encName: string;
}
export class HoldWorldMap {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly dataId: SignalUpdatableValue<number | undefined>;
	public readonly displayType: number;
	public readonly orderIndex: number;
	public readonly name: SignalUpdatableValue<string>;

	public get $data() {
		return this.dataId.newValue ? this.$hold.datas.getOrError(this.dataId.newValue) : undefined;
	}

	public constructor(hold: Hold, opts: Constructor) {
		this.$hold = hold;

		this.id = opts.id;
		this.dataId = new SignalUpdatableValue(opts.dataId);
		this.displayType = opts.displayType;
		this.orderIndex = opts.orderIndex;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));
	}
}
