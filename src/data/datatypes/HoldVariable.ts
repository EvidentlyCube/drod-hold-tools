import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";

interface VariableConstructor {
	id: number;
	encName: string;
}
export class HoldVariable {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly name: DrodText;

	public constructor(hold: Hold, opts: VariableConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.name = new DrodText(opts.encName);
	}
}
