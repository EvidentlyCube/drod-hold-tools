import { OrderedMap } from "../../utils/OrderedMap";
import { DrodText } from "./DrodText";
import { HoldChangeList } from "./HoldChange";
import { HoldChangeListener } from "./HoldChangeListener";
import { HoldCharacter } from "./HoldCharacter";
import { HoldData } from "./HoldData";
import { HoldEntrance } from "./HoldEntrance";
import { HoldLevel } from "./HoldLevel";
import { HoldPlayer } from "./HoldPlayer";
import { HoldRoom } from "./HoldRoom";
import { HoldSpeech } from "./HoldSpeech";
import { HoldVariable } from "./HoldVariable";

interface HoldConstructor {
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
	public readonly name: DrodText;
	public readonly descriptionMessage: DrodText;
	public readonly endHoldMessage: DrodText;
	public readonly lastScriptId: number;
	public readonly lastVarId: number;
	public readonly lastCharId: number;
	public readonly lastWorldMapId: number;
	public readonly startingLevelId: number;

	public readonly players = new OrderedMap<number, HoldPlayer>();
	public readonly variables = new OrderedMap<number, HoldVariable>();
	public readonly speeches = new OrderedMap<number, HoldSpeech>();
	public readonly entrances = new OrderedMap<number, HoldEntrance>();
	public readonly data = new OrderedMap<number, HoldData>();
	public readonly characters = new OrderedMap<number, HoldCharacter>();
	public readonly levels = new OrderedMap<number, HoldLevel>();
	public readonly rooms = new OrderedMap<number, HoldRoom>();

	public readonly $changes = new HoldChangeList();

	public constructor(options: HoldConstructor) {
		this.id = options.id;
		this.version = options.version;
		this.gidCreated = options.gidCreated;
		this.gidNewLevelIndex = options.gidNewLevelIndex;
		this.editingPrivileges = options.editingPrivileges;
		this.playerId = options.playerId;
		this.lastUpdated = options.lastUpdated;
		this.status = options.status;
		this.name = new DrodText(options.encName);
		this.descriptionMessage = new DrodText(options.encDescriptionMessage);
		this.endHoldMessage = new DrodText(options.encEndHoldMessage);
		this.lastScriptId = options.lastScriptId;
		this.lastVarId = options.lastVarId;
		this.lastCharId = options.lastCharId;
		this.lastWorldMapId = options.lastWorldMapId;
		this.startingLevelId = options.startingLevelId;
	}
}

