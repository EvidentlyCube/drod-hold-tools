import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { wcharBase64ToString } from "../Utils";
import { HoldRefRoom } from "../references/HoldReference";
import type { Hold } from "./Hold";

interface EntranceConstructor {
	id: number;
	roomId: number;
	dataId?: number;
	x: number;
	y: number;
	o: number;
	isMainEntrance: boolean;
	showDescription: number;
	encDescription: string;
}
export class HoldEntrance {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly roomId: number;
	public readonly dataId?: number;
	public readonly x: number;
	public readonly y: number;
	public readonly o: number;
	public readonly isMainEntrance: boolean;
	public readonly showDescription: SignalUpdatableValue<number>;
	public readonly description: SignalUpdatableValue<string>;

	public get $room() {
		return this.$hold.rooms.getOrError(this.roomId);
	}

	public get $level() {
		return this.$room.$level;
	}

	public get $roomRef(): HoldRefRoom {
		return {
			hold: this.$hold,
			model: 'room',
			roomId: this.roomId
		};
	}

	public get $data() {
		return this.dataId ? this.$hold.datas.get(this.dataId) : undefined;
	}

	public constructor(hold: Hold, opts: EntranceConstructor) {
		this.$hold = hold;

		this.id = opts.id;
		this.roomId = opts.roomId;
		this.dataId = opts.dataId;
		this.x = opts.x;
		this.y = opts.y;
		this.o = opts.o;
		this.isMainEntrance = opts.isMainEntrance;
		this.showDescription = new SignalUpdatableValue(opts.showDescription);
		this.description = new SignalUpdatableValue(wcharBase64ToString(opts.encDescription));
	}
}
