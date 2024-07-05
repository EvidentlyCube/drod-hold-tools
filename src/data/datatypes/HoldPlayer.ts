import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface PlayerConstructor {
	id: number;
	encOriginalName: string;
	gidCreated: number;
	encName: string;
}
export class HoldPlayer {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly gidOriginalName: SignalUpdatableValue<string>;
	public readonly gidCreated: number;
	public readonly name: SignalUpdatableValue<string>;

	public constructor(hold: Hold, opts: PlayerConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.gidOriginalName = new SignalUpdatableValue(wcharBase64ToString(opts.encOriginalName));
		this.gidCreated = opts.gidCreated;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));
	}
}
