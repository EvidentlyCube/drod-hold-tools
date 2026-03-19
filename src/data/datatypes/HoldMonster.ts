import { CommandsList } from "../CommandList";
import { packCommands, unpackCommands } from "../CommandUtils";
import { DEFAULT_PROCESSING_SEQUENCE, UINT_MINUS_1 } from "../DrodCommonTypes";
import { PackedVars } from "../PackedVars";
import { readPackedVars } from "../PackedVarsUtils";
import type { HoldRoom } from "./HoldRoom";

interface MonsterConstructor {
	type: number;
	x: number;
	y: number;
	o: number;
	processSequence?: number;
	encExtraVars?: string;
	isFirstTurn?: boolean;
}
interface MonsterPiece {
	type: number;
	x: number;
	y: number;
}
export class HoldMonster {
	public readonly $room: HoldRoom;

	public readonly $index: number;
	public readonly type: number;
	public readonly x: number;
	public readonly y: number;
	public readonly o: number;
	public readonly processSequence: number;
	public readonly extraVars?: PackedVars;
	public readonly isFirstTurn?: boolean;

	public readonly pieces: MonsterPiece[] = [];

	public readonly $commandList?: CommandsList;

	public get $hold() {
		return this.$room.$hold;
	}

	/**
	 * ID of the selected character typ if this is a character, (UINT)-1 otherwise
	 */
	public get $characterTypeId(): number {
		return this.extraVars?.readUint('id', UINT_MINUS_1) ?? UINT_MINUS_1;
	}

	public constructor(room: HoldRoom, index: number, opts: MonsterConstructor) {
		this.$room = room;
		this.$index = index;

		this.type = opts.type;
		this.x = opts.x;
		this.y = opts.y;
		this.o = opts.o;
		this.processSequence = opts.processSequence ?? DEFAULT_PROCESSING_SEQUENCE;
		this.extraVars = readPackedVars(opts.encExtraVars);
		this.isFirstTurn = opts.isFirstTurn;

		if (this.extraVars) {
			this.$commandList = unpackCommands(this.$hold, this.extraVars);
		}
	}

	public repackCommandsIntoExtraVars() {
		if (this.$commandList && this.extraVars) {
			packCommands(this.extraVars, this.$commandList);
		}
	}
}