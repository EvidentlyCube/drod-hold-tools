import type { Hold } from "./Hold";

/** @version 508+ */
export interface HoldSavedGameWorldMapIcon {
	worldMap: number;
	entranceId: number;
	x: number;
	y: number;
	imageId: number;
	charId: number;
	flags: number;
}

interface HoldSavedGameConstructor {
	id: number;
	playerId: number;
	roomId: number;
	worldMap: number;
	type: number;
	checkpointX: number;
	checkpointY: number;
	isHidden: boolean;
	lastUpdated: number;
	startRoomX: number;
	startRoomY: number;
	startRoomO: number;
	startRoomAppearance: number;
	startRoomSwordOff: number;
	startRoomWaterTraversal: number;
	startRoomWeaponType: number;
	exploredRooms: number[];
	conqueredRooms: number[];
	completedScripts: number[];
	entrancesExplored: number[];
	created: number;
	encCommands: string;
	levelDeaths: number;
	levelKills: number;
	levelMoves: number;
	levelTime: number;
	encStats: string;
	version: number;
}
export class HoldSavedGame {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly playerId: number;
	public readonly roomId: number;
	/** @version 508+ */
	public readonly worldMap: number;
	public readonly type: number;
	public readonly checkpointX: number;
	public readonly checkpointY: number;
	public readonly isHidden: boolean;
	public readonly lastUpdated: number;
	public readonly startRoomX: number;
	public readonly startRoomY: number;
	public readonly startRoomO: number;
	public readonly startRoomAppearance: number;
	public readonly startRoomSwordOff: number;
	/** @version 400+ */
	public readonly startRoomWaterTraversal: number;
	/** @version 508+ */
	public readonly startRoomWeaponType: number;
	public readonly exploredRooms: number[];
	public readonly conqueredRooms: number[];
	public readonly completedScripts: number[];
	/** @version 508+ */
	public readonly entrancesExplored: number[];
	public readonly created: number;
	public readonly encCommands: string;
	public readonly levelDeaths: number;
	public readonly levelKills: number;
	public readonly levelMoves: number;
	public readonly levelTime: number;
	public readonly encStats: string;
	public readonly version: number;
	/** @version 508+ */
	public readonly worldMapIcons: HoldSavedGameWorldMapIcon[] = [];

	public constructor(hold: Hold, opts: HoldSavedGameConstructor) {
		this.$hold = hold;

		this.id = opts.id
		this.playerId = opts.playerId;
		this.roomId = opts.roomId;
		this.worldMap = opts.worldMap;
		this.type = opts.type;
		this.checkpointX = opts.checkpointX;
		this.checkpointY = opts.checkpointY;
		this.isHidden = opts.isHidden;
		this.lastUpdated = opts.lastUpdated;
		this.startRoomX = opts.startRoomX;
		this.startRoomY = opts.startRoomY;
		this.startRoomO = opts.startRoomO;
		this.startRoomAppearance = opts.startRoomAppearance;
		this.startRoomSwordOff = opts.startRoomSwordOff;
		this.startRoomWaterTraversal = opts.startRoomWaterTraversal;
		this.startRoomWeaponType = opts.startRoomWeaponType;
		this.exploredRooms = opts.exploredRooms;
		this.conqueredRooms = opts.conqueredRooms;
		this.completedScripts = opts.completedScripts;
		this.entrancesExplored = opts.entrancesExplored;
		this.created = opts.created;
		this.encCommands = opts.encCommands;
		this.levelDeaths = opts.levelDeaths;
		this.levelKills = opts.levelKills;
		this.levelMoves = opts.levelMoves;
		this.levelTime = opts.levelTime;
		this.encStats = opts.encStats;
		this.version = opts.version;
	}
}