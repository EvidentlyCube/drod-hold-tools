import {Speech} from "./Speech";
import {Command} from "./Command";
import {Entrance} from "./Entrance";
import {Character} from "./Character";
import {Monster} from "./Monster";
import {Scroll} from "./Scroll";
import {Level} from "./Level";

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
		name?: boolean
	}
}

interface CharacterChange {
	type: "Character",
	model: Character;
	changes: {
		name?: boolean
	}
}

export type Change = SpeechChange | CommandChange | EntranceChange | ScrollChange | LevelChange | CharacterChange;