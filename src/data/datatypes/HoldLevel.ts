import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";

interface LevelConstructor {
	id: number;
	holdId: number;
	playerId: number;
	gidLevelIndex: number;
	orderIndex: number;
	encName: string;
	created: number;
	lastUpdated: number;
	isRequired: boolean;
}
export class HoldLevel {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly holdId: number;
	public readonly playerId: number;
	public readonly gidLevelIndex: number;
	public readonly orderIndex: number;
	public readonly name: DrodText;
	public readonly created: number;
	public readonly lastUpdated: number;
	public readonly isRequired: boolean;

	public constructor(hold: Hold, opts: LevelConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.holdId = opts.holdId;
		this.playerId = opts.playerId;
		this.gidLevelIndex = opts.gidLevelIndex;
		this.orderIndex = opts.orderIndex;
		this.name = new DrodText(opts.encName);
		this.created = opts.created;
		this.lastUpdated = opts.lastUpdated;
		this.isRequired = opts.isRequired;
	}
}
