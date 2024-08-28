import type { Hold } from "../datatypes/Hold";

export interface HoldRefCharacter {
	hold: Hold;
	model: 'character',
	characterId: number;
};

export interface HoldRefCharacterCommand {
	hold: Hold;
	model: 'charCommand',
	characterId: number;
	commandIndex: number;
};

export interface HoldRefCharacterAvatar {
	hold: Hold;
	model: 'charAvatar',
	characterId: number;
};

export interface HoldRefCharacterTiles {
	hold: Hold;
	model: 'charTiles',
	characterId: number;
};

export interface HoldRefData {
	hold: Hold;
	model: 'data',
	dataId: number;
}

export interface HoldRefEntranceVoiceOver {
	hold: Hold;
	model: 'entranceVoiceOver';
	entranceId: number;
}

export interface HoldRefHold {
	hold: Hold;
	model: 'hold';
}

export interface HoldRefLevel {
	hold: Hold;
	model: 'level';
	levelId: number;
}

export interface HoldRefMonsterCommand {
	hold: Hold;
	model: 'monsterCommand',
	roomId: number;
	monsterIndex: number;
	commandIndex: number;
};

export interface HoldRefRoom {
	hold: Hold;
	model: 'room';
	roomId: number;
}

export interface HoldRefRoomImage {
	hold: Hold;
	model: 'roomImage';
	roomId: number;
}

export interface HoldRefRoomOverheadImage {
	hold: Hold;
	model: 'roomOverheadImage';
	roomId: number;
}

export interface HoldRefScroll {
	hold: Hold;
	model: 'scroll',
	roomId: number;
	x: number;
	y: number;
};

export interface HoldRefSpeech {
	hold: Hold;
	model: 'speech',
	speechId: number;
};

export interface HoldRefWorldMap {
	hold: Hold;
	model: 'worldMap',
	worldMapId: number;
};

export interface HoldRefNotApplicable {
	hold: Hold;
	model: 'notApplicable',
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
	| HoldRefRoom
	| HoldRefRoomImage
	| HoldRefRoomOverheadImage
	| HoldRefScroll
	| HoldRefSpeech
	| HoldRefWorldMap