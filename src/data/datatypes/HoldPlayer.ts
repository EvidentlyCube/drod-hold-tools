import { DrodText } from "./DrodText";
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
	public readonly gidOriginalName: DrodText;
	public readonly gidCreated: number;
	public readonly name: DrodText;

	public constructor(hold: Hold, opts: PlayerConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.gidOriginalName = new DrodText(opts.encOriginalName);
		this.gidCreated = opts.gidCreated;
		this.name = new DrodText(opts.encName);
	}
}
