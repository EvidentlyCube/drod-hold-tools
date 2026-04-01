import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { drodMultilineStringToHtmlString } from "../../utils/StringUtils";
import type { Point } from "../DrodCommonTypes";
import type { PackedVars } from "../PackedVars";
import { readPackedVars } from "../PackedVarsUtils";
import { HoldRefModel, type HoldRefScroll } from "../references/HoldReference";
import { getCoordinateName, wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";
import type { HoldMonster } from "./HoldMonster";
import type { HoldSpeech } from "./HoldSpeech";

interface RoomConstructor {
	id: number;
	levelId: number;
	dataId?: number;
	overheadDataId?: number;
	isRequired: boolean;
	isSecret: boolean | undefined;
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
	style: number;
	encTileLights: string;
	encExtraVars?: string;
	isNestedInLevel: boolean;
}
interface Checkpoint {
	x: number;
	y: number;
}

interface ScrollConstructor {
	x: number;
	y: number;
	encMessage: string;
	roomId: number;
}
export class HoldScroll {
	public readonly id: string;
	public readonly x: number;
	public readonly y: number;
	public readonly message: SignalUpdatableValue<string>;

	public readonly $hold: Hold;
	public readonly $roomId: number;
	public readonly $scrollRef: HoldRefScroll;

	public get $room(): HoldRoom {
		return this.$hold.rooms.getOrError(this.$roomId);
	}

	constructor(hold: Hold, opts: ScrollConstructor) {
		this.$hold = hold;
		this.id = `${opts.roomId}:scroll:${opts.x}:${opts.y}`;

		this.x = opts.x;
		this.y = opts.y;
		this.message = new SignalUpdatableValue(
			drodMultilineStringToHtmlString(wcharBase64ToString(opts.encMessage)),
		);

		this.$roomId = opts.roomId;
		this.$scrollRef = {
			hold,
			model: HoldRefModel.Scroll,
			roomId: opts.roomId,
			x: opts.x,
			y: opts.y,
		};
	}
}

export interface HoldOrbAgent {
	type: number;
	x: number;
	y: number;
}
export interface HoldOrb {
	/** @version 301+ */
	type: number | undefined;
	x: number;
	y: number;
	agents: HoldOrbAgent[];
}
export interface HoldExit {
	/** @version 201+ */
	entranceId: number;
	/** @version 100 */
	levelId: number;
	left: number;
	right: number;
	top: number;
	bottom: number;
}
export class HoldRoom {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly levelId: number;
	public readonly dataId?: number;
	public readonly overheadDataId?: number;
	public readonly isRequired: boolean;
	public readonly isSecret: boolean | undefined;
	public readonly roomX: number;
	public readonly roomY: number;
	public readonly roomCols: number;
	public readonly roomRows: number;
	public readonly imageStartX?: number;
	public readonly imageStartY?: number;
	public readonly overheadImageStartX?: number;
	public readonly overheadImageStartY?: number;
	public readonly encSquares: string;
	/** @version 301+, before used `style`*/
	public readonly styleName: SignalUpdatableValue<string>;
	/** @version 100,201, afterwards replaced by `styleName` */
	public readonly style: number;
	/** @version 301+ */
	public readonly encTileLights: string;
	public readonly extraVars?: PackedVars;
	/**
	 * @version 201 In JtRH some holds contain room tags in Levels node and
	 * some in Holds node; some even have a mixture of both.
	 */
	public readonly isNestedInLevel: boolean;

	public readonly checkpoints: Checkpoint[] = [];
	public readonly monsters: HoldMonster[] = [];
	public readonly scrolls: HoldScroll[] = [];
	public readonly orbs: HoldOrb[] = [];
	public readonly exits: HoldExit[] = [];

	private _monstersWithCommands?: ReadonlyArray<HoldMonster>;
	private _monstersWithSpeechCommand?: ReadonlyArray<HoldMonster>;
	private _monstersWithDataCommand?: ReadonlyArray<HoldMonster>;
	private _speeches?: ReadonlyArray<HoldSpeech>;

	public get $monstersWithCommands() {
		if (!this._monstersWithCommands) {
			this._monstersWithCommands = this.monsters.filter(
				monster => !!monster.$commandList,
			);
		}

		return this._monstersWithCommands;
	}

	public get $monstersWithSpeechCommand() {
		if (!this._monstersWithSpeechCommand) {
			this._monstersWithSpeechCommand = this.monsters.filter(
				monster => monster.$commandList?.$commandsWithSpeech?.length,
			);
		}

		return this._monstersWithSpeechCommand;
	}

	public get $monstersWithDataCommand() {
		if (!this._monstersWithDataCommand) {
			this._monstersWithDataCommand = this.monsters.filter(
				monster => monster.$commandList?.$commandsWithData?.length,
			);
		}

		return this._monstersWithDataCommand;
	}

	public get $speeches() {
		if (!this._speeches) {
			this._speeches = this.$monstersWithSpeechCommand.reduce(
				(speeches, monster) => {
					for (const command of monster.$commandList?.$commandsWithSpeech
						?? []) {
						const speech = this.$hold.speeches.get(command.speechId.newValue);

						if (speech) {
							speeches.push(speech);
						}
					}
					return speeches;
				},
				[] as HoldSpeech[],
			);
		}

		return this._speeches;
	}

	public get $level() {
		return this.$hold.levels.getOrError(this.levelId);
	}

	public get $coordsInLevel(): Point {
		const { x, y } = this.$level.$entranceCoords;

		return {
			x: this.roomX - x,
			y: this.roomY - y,
		};
	}

	public get $coordsName(): string {
		const { x, y } = this.$coordsInLevel;

		return getCoordinateName(x, y);
	}

	public getScroll(ref: { x: number; y: number }): HoldScroll | undefined;
	public getScroll(x: number, y: number): HoldScroll | undefined;
	public getScroll(
		refOrX: { x: number; y: number } | number,
		y?: number,
	): HoldScroll | undefined {
		if (typeof refOrX !== "number") {
			return this.getScroll(refOrX.x, refOrX.y);
		}

		return this.scrolls.find(scroll => scroll.x === refOrX && scroll.y === y);
	}

	public constructor(hold: Hold, opts: RoomConstructor) {
		this.$hold = hold;

		this.id = opts.id;
		this.levelId = opts.levelId;
		this.dataId = opts.dataId;
		this.overheadDataId = opts.overheadDataId;
		this.isRequired = opts.isRequired;
		this.isSecret = opts.isSecret;
		this.roomX = opts.roomX;
		this.roomY = opts.roomY;
		this.roomCols = opts.roomCols;
		this.roomRows = opts.roomRows;
		this.imageStartX = opts.imageStartX;
		this.imageStartY = opts.imageStartY;
		this.overheadImageStartX = opts.overheadImageStartX;
		this.overheadImageStartY = opts.overheadImageStartY;
		this.encSquares = opts.encSquares;
		this.style = opts.style;
		this.styleName = new SignalUpdatableValue(
			wcharBase64ToString(opts.encStyleName),
		);
		this.encTileLights = opts.encTileLights;
		this.extraVars = readPackedVars(opts.encExtraVars);
		this.isNestedInLevel = opts.isNestedInLevel;
	}
}
