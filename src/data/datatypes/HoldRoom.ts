import { PackedVars } from "../PackedVars";
import { readPackedVars } from "../PackedVarsUtils";
import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";
import type { HoldMonster } from "./HoldMonster";

interface RoomConstructor {
	id: number;
	levelId: number;
	dataId?: number;
	overheadDataId?: number;
	isRequired: boolean;
	isSecret: boolean;
	roomX: number;
	roomY: number;
	roomCols: number;
	roomRows: number;
	imageStartX?: number;
	imageStartY?: number;
	overheadImageStartX?: number;
	overheadImageStartY?: number;
	encSquares: string;
	encStyleName: string;
	encTileLights: string;
	encExtraVars?: string;
}
interface Checkpoint {
	x: number;
	y: number;
}
export interface HoldScroll {
	x: number;
	y: number;
	message: DrodText;
}
export interface HoldOrbAgent {
	type: number;
	x: number;
	y: number;
}
export interface HoldOrb {
	type: number;
	x: number;
	y: number;
	agents: HoldOrbAgent[];
}
export interface HoldExit {
	entranceId: number;
	left: number;
	right: number;
	top: number;
	bottom: number;
}
export class HoldRoom {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly levelId: number;
	public readonly dataId?: number;
	public readonly overheadDataId?: number;
	public readonly isRequired: boolean;
	public readonly isSecret: boolean;
	public readonly roomX: number;
	public readonly roomY: number;
	public readonly roomCols: number;
	public readonly roomRows: number;
	public readonly imageStartX?: number;
	public readonly imageStartY?: number;
	public readonly overheadImageStartX?: number;
	public readonly overheadImageStartY?: number;
	public readonly encSquares: string;
	public readonly styleName: DrodText;
	public readonly encTileLights: string;
	public readonly extraVars?: PackedVars;

	public readonly checkpoints: Checkpoint[] = [];
	public readonly monsters: HoldMonster[] = [];
	public readonly scrolls: HoldScroll[] = [];
	public readonly orbs: HoldOrb[] = [];
	public readonly exits: HoldExit[] = [];

	public constructor(hold: Hold, opts: RoomConstructor) {
		this.hold = hold;

		this.id = opts.id
		this.levelId = opts.levelId
		this.dataId = opts.dataId
		this.overheadDataId = opts.overheadDataId
		this.isRequired = opts.isRequired;
		this.isSecret = opts.isSecret;
		this.roomX = opts.roomX
		this.roomY = opts.roomY
		this.roomCols = opts.roomCols
		this.roomRows = opts.roomRows
		this.imageStartX = opts.imageStartX;
		this.imageStartY = opts.imageStartY;
		this.overheadImageStartX = opts.overheadImageStartX;
		this.overheadImageStartY = opts.overheadImageStartY;
		this.encSquares = opts.encSquares
		this.styleName = new DrodText(opts.encStyleName)
		this.encTileLights = opts.encTileLights
		this.extraVars = readPackedVars(opts.encExtraVars);
	}
}