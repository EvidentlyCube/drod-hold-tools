import { areObjectsSame } from "../../utils/ObjectUtils";
import type { Hold } from "../datatypes/Hold";
import { HoldRoom } from "../datatypes/HoldRoom";
import { ScriptCommand } from "../datatypes/ScriptCommand";

export enum HoldRefModel {
	Character = 'character',
	CharacterAvatar = 'charAvatar',
	CharacterCommand = 'charCommand',
	CharacterTiles = 'charTiles',
	Data = 'data',
	Entrance = 'entrance',
	EntranceVoiceOver = 'entranceVoiceOver',
	Hold = 'hold',
	HoldEndMessage = 'holdEndMessage',
	Level = 'level',
	MonsterCharacterType = 'monsterCharacterType',
	MonsterCommand = 'monsterCommand',
	NotApplicable = 'notApplicable',
	Player = 'player',
	Room = 'room',
	RoomImage = 'roomImage',
	RoomOverheadImage = 'roomOverheadImage',
	Scroll = 'scroll',
	Speech = 'speech',
	WorldMap = 'worldMap',
}

export interface HoldRefCharacter {
	hold: Hold;
	model: HoldRefModel.Character,
	characterId: number;
};

export interface HoldRefCharacterCommand {
	hold: Hold;
	model: HoldRefModel.CharacterCommand,
	characterId: number;
	commandIndex: number;
};

export interface HoldRefCharacterAvatar {
	hold: Hold;
	model: HoldRefModel.CharacterAvatar,
	characterId: number;
};

export interface HoldRefCharacterTiles {
	hold: Hold;
	model: HoldRefModel.CharacterTiles,
	characterId: number;
};

export interface HoldRefData {
	hold: Hold;
	model: HoldRefModel.Data,
	dataId: number;
}

export interface HoldRefEntrance {
	hold: Hold;
	model: HoldRefModel.Entrance;
	entranceId: number;
}

export interface HoldRefEntranceVoiceOver {
	hold: Hold;
	model: HoldRefModel.EntranceVoiceOver;
	entranceId: number;
}

export interface HoldRefHold {
	hold: Hold;
	model: HoldRefModel.Hold;
}

export interface HoldRefHoldEndMessage {
	hold: Hold;
	model: HoldRefModel.HoldEndMessage;
}

export interface HoldRefLevel {
	hold: Hold;
	model: HoldRefModel.Level;
	levelId: number;
}

export interface HoldRefMonsterCharacterType {
	hold: Hold;
	model: HoldRefModel.MonsterCharacterType,
	roomId: number;
	monsterIndex: number;
};

export interface HoldRefMonsterCommand {
	hold: Hold;
	model: HoldRefModel.MonsterCommand,
	roomId: number;
	monsterIndex: number;
	commandIndex: number;
};

export interface HoldRefPlayer {
	hold: Hold;
	model: HoldRefModel.Player,
	playerId: number;
};

export interface HoldRefRoom {
	hold: Hold;
	model: HoldRefModel.Room;
	roomId: number;
}

export interface HoldRefRoomImage {
	hold: Hold;
	model: HoldRefModel.RoomImage;
	roomId: number;
}

export interface HoldRefRoomOverheadImage {
	hold: Hold;
	model: HoldRefModel.RoomOverheadImage;
	roomId: number;
}

export interface HoldRefScroll {
	hold: Hold;
	model: HoldRefModel.Scroll,
	roomId: number;
	x: number;
	y: number;
};

export interface HoldRefSpeech {
	hold: Hold;
	model: HoldRefModel.Speech,
	speechId: number;
};

export interface HoldRefWorldMap {
	hold: Hold;
	model: HoldRefModel.WorldMap,
	worldMapId: number;
};

export interface HoldRefNotApplicable {
	hold: Hold;
	model: HoldRefModel.NotApplicable,
};

export type HoldRef = HoldRefNotApplicable
	| HoldRefCharacter
	| HoldRefCharacterAvatar
	| HoldRefCharacterCommand
	| HoldRefCharacterTiles
	| HoldRefData
	| HoldRefEntrance
	| HoldRefEntranceVoiceOver
	| HoldRefHold
	| HoldRefHoldEndMessage
	| HoldRefLevel
	| HoldRefMonsterCharacterType
	| HoldRefMonsterCommand
	| HoldRefPlayer
	| HoldRefRoom
	| HoldRefRoomImage
	| HoldRefRoomOverheadImage
	| HoldRefScroll
	| HoldRefSpeech
	| HoldRefWorldMap;

export function areReferencesIdentical(left: HoldRef, right: HoldRef) {
	return areObjectsSame(left, right);
}

export function resolveReference(ref: undefined): undefined;
export function resolveReference(ref: HoldRefMonsterCommand): ScriptCommand;
export function resolveReference(ref: HoldRefCharacterCommand): ScriptCommand;
export function resolveReference(ref: HoldRefMonsterCommand | HoldRefCharacterCommand): ScriptCommand;
export function resolveReference(ref?: HoldRefMonsterCommand | HoldRefCharacterCommand): ScriptCommand | undefined;
export function resolveReference(ref: HoldRefRoom): HoldRoom;
export function resolveReference(
	ref: HoldRefRoom | HoldRefMonsterCommand | HoldRefCharacterCommand | undefined
): ScriptCommand | HoldRoom | undefined {
	if (!ref) {
		return undefined;
	}

	const { hold } = ref;
	switch (ref.model) {
		case HoldRefModel.MonsterCommand:
			return hold.rooms.getOrError(ref.roomId).monsters[ref.monsterIndex].$commandList!.commands[ref.commandIndex];
		case HoldRefModel.CharacterCommand:
			return hold.characters.getOrError(ref.characterId).$commandList!.commands[ref.commandIndex]!;
		case HoldRefModel.Room:
			return hold.rooms.getOrError(ref.roomId);
	}
}

