import { CommandsList } from "../CommandList";
import { readCommandsBuffer } from "../CommandUtils";
import { DEFAULT_PROCESSING_SEQUENCE } from "../DrodCommonTypes";
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
}
interface MonsterPiece {
	type: number;
	x: number;
	y: number;
}
export class HoldMonster {
	public readonly room: HoldRoom;

	public readonly type: number;
	public readonly x: number;
	public readonly y: number;
	public readonly o: number;
	public readonly processSequence: number;
	public readonly extraVars?: PackedVars;

	public readonly pieces: MonsterPiece[] = [];

	public readonly $commandList?: CommandsList;

	public constructor(room: HoldRoom, opts: MonsterConstructor) {
		this.room = room;

		this.type = opts.type;
		this.x = opts.x;
		this.y = opts.y;
		this.o = opts.o;
		this.processSequence = opts.processSequence ?? DEFAULT_PROCESSING_SEQUENCE;
		this.extraVars = readPackedVars(opts.encExtraVars);

		if (this.extraVars && this.extraVars.hasVar('Commands')) {
			this.$commandList = new CommandsList(room.hold, readCommandsBuffer(this.extraVars.readByteBuffer('Commands', [])));
		}
	}
}