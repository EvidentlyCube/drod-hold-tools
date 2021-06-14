import {Speech} from "./Speech";
import {Command} from "./Command";
import {Entrance} from "./Entrance";
import {Character} from "./Character";
import {Monster} from "./Monster";
import {Scroll} from "./Scroll";
import {Level} from "./Level";
import {Hold} from "./Hold";
import {Player} from "./Player";

interface HoldChange {
	type: "Hold";
	model: Hold;
	changes: {
		name?: boolean;
		description?: boolean;
		ending?: boolean;
	}
}

interface PlayerChange {
	type: "Player";
	model: Player;
	changes: {
		delete?: boolean;
		create?: boolean;
		name?: boolean;
	}
}

interface SpeechChange {
	type: "Speech";
	model: Speech;
	changes: {
		delete?: boolean;
		text?: boolean;
	}
}

interface CommandChange {
	type: "Command",
	model: Command;
	source: Character | Monster;
	changes: {
		speechId?: boolean
	}
}

interface EntranceChange {
	type: "Entrance",
	model: Entrance;
	changes: {
		description?: boolean
	}
}

interface ScrollChange {
	type: "Scroll",
	model: Scroll;
	changes: {
		text?: boolean
	}
}

interface LevelChange {
	type: "Level",
	model: Level;
	changes: {
		name?: boolean,
		playerId?: boolean,
		dateCreated?: boolean
	}
}

interface CharacterChange {
	type: "Character",
	model: Character;
	changes: {
		name?: boolean
	}
}

export type Change = HoldChange 
	| SpeechChange 
	| CommandChange
	| EntranceChange
	| ScrollChange
	| LevelChange 
	| CharacterChange 
	| PlayerChange;