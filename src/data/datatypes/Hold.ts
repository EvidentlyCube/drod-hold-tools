import { OrderedMap } from "../../utils/OrderedMap";
import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import type { HoldVersion } from "../HoldVersion";
import {
	areReferencesIdentical,
	type HoldRef,
} from "../references/HoldReference";
import { stringToWCharBase64, wcharBase64ToString } from "../Utils";
import { HoldChangeList } from "./HoldChange";
import { HoldChangeListener } from "./HoldChangeListener";
import type { HoldCharacter } from "./HoldCharacter";
import type { HoldData } from "./HoldData";
import type { HoldDemo } from "./HoldDemo";
import type { HoldEntrance } from "./HoldEntrance";
import type { HoldLevel } from "./HoldLevel";
import type { HoldMonster } from "./HoldMonster";
import { HoldPlayer } from "./HoldPlayer";
import type { HoldRoom, HoldScroll } from "./HoldRoom";
import type { HoldSavedGame } from "./HoldSavedGame";
import type { HoldSpeech } from "./HoldSpeech";
import type { HoldVariable } from "./HoldVariable";
import type { HoldWorldMap } from "./HoldWorldMap";

interface HoldProblem {
	id: number;
	ref: HoldRef;
	problem: string;
}
interface HoldConstructor {
	$holdReaderId: number;
	$isDataFrontLoaded: boolean;
	$hasEndHoldMessage: boolean;

	id: number;
	version: HoldVersion;

	gidCreated: number;
	gidNewLevelIndex: number;

	editingPrivileges: number;

	playerId: number;
	lastUpdated: number;
	status: number | undefined;
	encName: string;

	encDescriptionMessage: string;
	encEndHoldMessage: string;
	encDrodInfo: string;

	lastScriptId: number;
	lastVarId: number;
	lastCharId: number;
	lastWorldMapId: number;
	startingLevelId: number;
}

export class Hold {
	public readonly id: number;
	public readonly version: HoldVersion;
	public readonly gidCreated: number;
	public readonly gidNewLevelIndex: number;
	public readonly editingPrivileges: number;
	public readonly playerId: SignalUpdatableValue<number>;
	public readonly lastUpdated: number;
	public readonly status: number | undefined;
	public readonly name: SignalUpdatableValue<string>;
	public readonly descriptionMessage: SignalUpdatableValue<string>;
	public readonly endHoldMessage: SignalUpdatableValue<string>;
	public readonly lastScriptId: number;
	public readonly lastVarId: number;
	public readonly lastCharId: number;
	public readonly lastWorldMapId: number;
	public readonly startingLevelId: number;
	/** Should NOT be here but there is at least one official hold that has it */
	public readonly encDrodInfo: string;

	public readonly players = new OrderedMap<number, HoldPlayer>();
	public readonly variables = new OrderedMap<number, HoldVariable>();
	public readonly speeches = new OrderedMap<number, HoldSpeech>();
	public readonly entrances = new OrderedMap<number, HoldEntrance>();
	public readonly datas = new OrderedMap<number, HoldData>();
	public readonly characters = new OrderedMap<number, HoldCharacter>();
	public readonly levels = new OrderedMap<number, HoldLevel>();
	public readonly rooms = new OrderedMap<number, HoldRoom>();
	public readonly worldMaps = new OrderedMap<number, HoldWorldMap>();
	public readonly demos = new OrderedMap<number, HoldDemo>();
	public readonly savedGames = new OrderedMap<number, HoldSavedGame>();

	public readonly $holdReaderId: number;

	/**
	 * There is no consistency in whether all data is front loaded at the start
	 * of the hold file or listed right before being used so we detect that on
	 * import and follow the detected convention.
	 */
	public readonly $isDataFrontLoaded: boolean;
	/**
	 * Back in AE it was possible for EndHoldMessage attribute to not be
	 * present
	 */
	public readonly $hasEndHoldMessage: boolean;
	public readonly $changes = new HoldChangeList();

	public readonly $problems: HoldProblem[] = [];
	public readonly $changeListener = new HoldChangeListener();

	private $_scrollsCache?: HoldScroll[];
	public get $scrolls(): readonly HoldScroll[] {
		if (!this.$_scrollsCache) {
			this.$_scrollsCache = [];

			for (const room of this.rooms.values()) {
				this.$_scrollsCache.push(...room.scrolls);
			}
		}

		return this.$_scrollsCache;
	}

	private $_monstersCache?: HoldMonster[];
	public get $monsters(): readonly HoldMonster[] {
		if (!this.$_monstersCache) {
			this.$_monstersCache = [];

			for (const room of this.rooms.values()) {
				this.$_monstersCache.push(...room.monsters);
			}
		}

		return this.$_monstersCache;
	}

	public constructor(options: HoldConstructor) {
		this.$holdReaderId = options.$holdReaderId;
		this.$isDataFrontLoaded = options.$isDataFrontLoaded;
		this.$hasEndHoldMessage = options.$hasEndHoldMessage;

		this.id = options.id;
		this.version = options.version;
		this.gidCreated = options.gidCreated;
		this.gidNewLevelIndex = options.gidNewLevelIndex;
		this.editingPrivileges = options.editingPrivileges;
		this.playerId = new SignalUpdatableValue(options.playerId);
		this.lastUpdated = options.lastUpdated;
		this.status = options.status;
		this.name = new SignalUpdatableValue(wcharBase64ToString(options.encName));
		this.descriptionMessage = new SignalUpdatableValue(
			wcharBase64ToString(options.encDescriptionMessage),
		);
		this.endHoldMessage = new SignalUpdatableValue(
			wcharBase64ToString(options.encEndHoldMessage),
		);
		this.lastScriptId = options.lastScriptId;
		this.lastVarId = options.lastVarId;
		this.lastCharId = options.lastCharId;
		this.lastWorldMapId = options.lastWorldMapId;
		this.startingLevelId = options.startingLevelId;
		this.encDrodInfo = options.encDrodInfo;
	}

	public addNewPlayer(source?: {
		id: number;
		name: string;
		gidOriginalName: string;
		gidCreated: number;
	}) {
		const id = source?.id ?? this.nextAvailablePlayerId();
		const player = new HoldPlayer(this, {
			id,
			encOriginalName: stringToWCharBase64(
				source?.gidOriginalName ?? id.toString(),
			),
			gidCreated: source?.gidCreated ?? Date.now(),
			encName: stringToWCharBase64(source?.name ?? `New Player ${id}`),
			$isNewlyAdded: true,
			encEmailMessage: "",
		});

		this.players.set(id, player);
		this.$changeListener.registerNewPlayer(player);
	}

	public registerProblem(problem: string, ref: HoldRef): void {
		for (const existingProblem of this.$problems) {
			// Do not allow duplicate problems to be registered
			if (
				areReferencesIdentical(ref, existingProblem.ref)
				&& problem === existingProblem.problem
			) {
				return;
			}
		}

		this.$problems.push({
			id: this.$problems.length + 1,
			problem,
			ref,
		});
	}

	private nextAvailablePlayerId() {
		return (
			this.players.keys().reduce((max, next) => Math.max(max, next), 0) + 1
		);
	}
}
