import type { Hold } from "../datatypes/Hold";

export interface HoldRefSpeech {
	hold: Hold;
	model: 'speech',
	speechId: number;
};

export interface HoldRefCharacterCommand {
	hold: Hold;
	model: 'charCommand',
	characterId: number;
	commandIndex: number;
};

export interface HoldRefMonsterCommand {
	hold: Hold;
	model: 'monsterCommand',
	roomId: number;
	monsterIndex: number;
	commandIndex: number;
};

export interface HoldRefNotApplicable {
	hold: Hold;
	model: 'notApplicable',
};

export type HoldRef = HoldRefSpeech
	| HoldRefCharacterCommand
	| HoldRefMonsterCommand
	| HoldRefNotApplicable;