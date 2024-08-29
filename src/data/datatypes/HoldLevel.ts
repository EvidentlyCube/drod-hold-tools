import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { getMainEntranceId } from "../HoldUtils";
import { wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";
import { HoldRoom } from "./HoldRoom";

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
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly holdId: number;
	public readonly playerId: SignalUpdatableValue<number>;
	public readonly gidLevelIndex: number;
	public readonly orderIndex: number;
	public readonly name: SignalUpdatableValue<string>;
	public readonly createdTimestamp: SignalUpdatableValue<number>;
	public readonly lastUpdated: number;
	public readonly isRequired: boolean;

	private $_primaryEntranceIdCache?: number;
	private $_roomsCache?: readonly HoldRoom[];

	public get $player() {
		return this.$hold.players.getOrError(this.playerId.newValue);
	}

	public get $primaryEntranceId() {
		if (this.$_primaryEntranceIdCache === undefined) {
			this.$_primaryEntranceIdCache = getMainEntranceId(this.$hold, this.id) ?? 0;
		}

		return this.$_primaryEntranceIdCache;
	}

	public get $entranceCoords() {
		const { roomX, roomY } = this.$hold.entrances.getOrError(this.$primaryEntranceId).$room;

		return { x: roomX, y: roomY };
	}

	public get $rooms() {
		if (!this.$_roomsCache) {
			this.$_roomsCache = this.$hold.rooms.filterToArray(room => room.levelId === this.id);
		}

		return this.$_roomsCache;
	}

	public constructor(hold: Hold, opts: LevelConstructor) {
		this.$hold = hold;

		this.id = opts.id;
		this.holdId = opts.holdId;
		this.playerId = new SignalUpdatableValue(opts.playerId);
		this.gidLevelIndex = opts.gidLevelIndex;
		this.orderIndex = opts.orderIndex;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));
		this.createdTimestamp = new SignalUpdatableValue(opts.created * 1000);
		this.lastUpdated = opts.lastUpdated;
		this.isRequired = opts.isRequired;
	}
}
