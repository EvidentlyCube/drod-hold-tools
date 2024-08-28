import type { Hold } from "../datatypes/Hold";

export enum HoldRefModel {
	Character = 'character',
	CharacterCommand = 'charCommand',
	CharacterAvatar = 'charAvatar',
	CharacterTiles = 'charTiles',
	Data = 'data',
	EntranceVoiceOver = 'entranceVoiceOver',
	Hold = 'hold',
	Level = 'level',
	MonsterCommand = 'monsterCommand',
	Player = 'player',
	Room = 'room',
	RoomImage = 'roomImage',
	RoomOverheadImage = 'roomOverheadImage',
	Scroll = 'scroll',
	Speech = 'speech',
	WorldMap = 'worldMap',
	NotApplicable = 'notApplicable',
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

export interface HoldRefEntranceVoiceOver {
	hold: Hold;
	model: HoldRefModel.EntranceVoiceOver;
	entranceId: number;
}

export interface HoldRefHold {
	hold: Hold;
	model: HoldRefModel.Hold;
}

export interface HoldRefLevel {
	hold: Hold;
	model: HoldRefModel.Level;
	levelId: number;
}

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
	| HoldRefCharacterCommand
	| HoldRefCharacterAvatar
	| HoldRefCharacterTiles
	| HoldRefData
	| HoldRefEntranceVoiceOver
	| HoldRefHold
	| HoldRefLevel
	| HoldRefMonsterCommand
	| HoldRefPlayer
	| HoldRefRoom
	| HoldRefRoomImage
	| HoldRefRoomOverheadImage
	| HoldRefScroll
	| HoldRefSpeech
	| HoldRefWorldMap