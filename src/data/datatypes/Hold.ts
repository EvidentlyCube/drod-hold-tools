import { OrderedMap } from "../../utils/OrderedMap";
import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { stringToWCharBase64, wcharBase64ToString } from "../Utils";
import type { HoldRef } from "../references/HoldReference";
import { HoldChangeList } from "./HoldChange";
import { HoldChangeListener } from "./HoldChangeListener";
import type { HoldCharacter } from "./HoldCharacter";
import type { HoldData } from "./HoldData";
import type { HoldEntrance } from "./HoldEntrance";
import type { HoldLevel } from "./HoldLevel";
import { HoldPlayer } from "./HoldPlayer";
import type { HoldRoom, HoldScroll } from "./HoldRoom";
import type { HoldSpeech } from "./HoldSpeech";
import type { HoldVariable } from "./HoldVariable";
import { HoldWorldMap } from "./HoldWorldMap";

interface HoldProblem {
	ref: HoldRef;
	problem: string;
}
interface HoldConstructor {
	$holdReaderId: number;

	id: number;
	version: number;

	gidCreated: number;
	gidNewLevelIndex: number;

	editingPrivileges: number;

	playerId: number;
	lastUpdated: number;
	status: number;
	encName: string;

	encDescriptionMessage: string;
	encEndHoldMessage: string;

	lastScriptId: number;
	lastVarId: number;
	lastCharId: number;
	lastWorldMapId: number;
	startingLevelId: number;
}

export class Hold {
	public readonly id: number;
	public readonly version: number;
	public readonly gidCreated: number;
	public readonly gidNewLevelIndex: number;
	public readonly editingPrivileges: number;
	public readonly playerId: number;
	public readonly lastUpdated: number;
	public readonly status: number;
	public readonly name: SignalUpdatableValue<string>;
	public readonly descriptionMessage: SignalUpdatableValue<string>;
	public readonly endHoldMessage: SignalUpdatableValue<string>;
	public readonly lastScriptId: number;
	public readonly lastVarId: number;
	public readonly lastCharId: number;
	public readonly lastWorldMapId: number;
	public readonly startingLevelId: number;

	public readonly players = new OrderedMap<number, HoldPlayer>();
	public readonly variables = new OrderedMap<number, HoldVariable>();
	public readonly speeches = new OrderedMap<number, HoldSpeech>();
	public readonly entrances = new OrderedMap<number, HoldEntrance>();
	public readonly datas = new OrderedMap<number, HoldData>();
	public readonly characters = new OrderedMap<number, HoldCharacter>();
	public readonly levels = new OrderedMap<number, HoldLevel>();
	public readonly rooms = new OrderedMap<number, HoldRoom>();
	public readonly worldMaps = new OrderedMap<number, HoldWorldMap>();

	/** Currently not used, stored only so it can be included during export */
	public readonly demosAndSavedGames: string[] = [];

	public readonly $holdReaderId: number;
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

	public constructor(options: HoldConstructor) {
		this.$holdReaderId = options.$holdReaderId;

		this.id = options.id;
		this.version = options.version;
		this.gidCreated = options.gidCreated;
		this.gidNewLevelIndex = options.gidNewLevelIndex;
		this.editingPrivileges = options.editingPrivileges;
		this.playerId = options.playerId;
		this.lastUpdated = options.lastUpdated;
		this.status = options.status;
		this.name = new SignalUpdatableValue(wcharBase64ToString(options.encName));
		this.descriptionMessage = new SignalUpdatableValue(wcharBase64ToString(options.encDescriptionMessage));
		this.endHoldMessage = new SignalUpdatableValue(wcharBase64ToString(options.encEndHoldMessage));
		this.lastScriptId = options.lastScriptId;
		this.lastVarId = options.lastVarId;
		this.lastCharId = options.lastCharId;
		this.lastWorldMapId = options.lastWorldMapId;
		this.startingLevelId = options.startingLevelId;
	}

	public addNewPlayer(source?: {id: number, name: string, gidOriginalName: string, gidCreated: number}) {
		const id = source?.id ?? this.nextAvailablePlayerId();
		const player = new HoldPlayer(this, {
			id,
			encOriginalName: stringToWCharBase64(source?.gidOriginalName ?? id.toString()),
			gidCreated: source?.gidCreated ?? Date.now(),
			encName: stringToWCharBase64(source?.name ?? `New Player ${id}`),
			$isNewlyAdded: true
		});

		this.players.set(id, player);
		this.$changeListener.registerNewPlayer(player);
	}

	private nextAvailablePlayerId() {
		return this.players.keys().reduce((max, next) => Math.max(max, next), 0) + 1;
	}
}

