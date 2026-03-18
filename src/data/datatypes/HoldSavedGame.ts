import { getSpeakerMood, getSpeakerName, wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface SavedGameConstructor {
	id: number;
	playerId: number;
	roomId: number;
	type: number;
	checkpointX: number;
	checkpointY: number;
	isHidden: boolean;
	lastUpdated: number;
	startRoomX: number;
	startRoomY: number;
	startRoomO: number;
	exploredRooms: number[];
	conqueredRooms: number[];
	created: number;
	encCommands: string;
}
export class HoldSavedGame {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly playerId: number;
	public readonly roomId: number;
	public readonly type: number;
	public readonly checkpointX: number;
	public readonly checkpointY: number;
	public readonly isHidden: boolean;
	public readonly lastUpdated: number;
	public readonly startRoomX: number;
	public readonly startRoomY: number;
	public readonly startRoomO: number;
	public readonly exploredRooms: number[];
	public readonly conqueredRooms: number[];
	public readonly created: number;
	public readonly encCommands: string;

	public constructor(hold: Hold, opts: SavedGameConstructor) {
		this.$hold = hold;

		this.id = opts.id
		this.playerId = opts.playerId;
		this.roomId = opts.roomId;
		this.type = opts.type;
		this.checkpointX = opts.checkpointX;
		this.checkpointY = opts.checkpointY;
		this.isHidden = opts.isHidden;
		this.lastUpdated = opts.lastUpdated;
		this.startRoomX = opts.startRoomX;
		this.startRoomY = opts.startRoomY;
		this.startRoomO = opts.startRoomO;
		this.exploredRooms = opts.exploredRooms;
		this.conqueredRooms = opts.conqueredRooms;
		this.created = opts.created;
		this.encCommands = opts.encCommands;
	}
}