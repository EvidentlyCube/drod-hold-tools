import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";

interface EntranceConstructor {
	id: number;
	roomId: number;
	dataId?: number;
	x: number;
	y: number;
	o: number;
	isMainEntrance: boolean;
	showDescription: boolean;
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
	public readonly showDescription: boolean;
	public readonly description: DrodText;

	public get $room() {
		return this.$hold.rooms.getOrError(this.roomId);
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
		this.showDescription = opts.showDescription;
		this.description = new DrodText(opts.encDescription);
	}
}
