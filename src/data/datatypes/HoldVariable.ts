import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface VariableConstructor {
	id: number;
	encName: string;
}
export class HoldVariable {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly name: SignalUpdatableValue<string>;

	public constructor(hold: Hold, opts: VariableConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));
	}
}
