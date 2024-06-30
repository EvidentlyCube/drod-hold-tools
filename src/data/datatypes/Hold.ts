import { DrodText } from "./DrodText";
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

	public readonly players: Record<number, HoldPlayer> = {};
	public readonly variables: Record<number, HoldVariable> = {};
	public readonly speeches: Record<number, HoldSpeech> = {};
	public readonly entrances: Record<number, HoldEntrance> = {};
	public readonly data: Record<number, HoldData> = {};
	public readonly characters: Record<number, HoldCharacter> = {};
	public readonly levels: Record<number, HoldLevel> = {};
	public readonly rooms: Record<number, HoldRoom> = {};

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

