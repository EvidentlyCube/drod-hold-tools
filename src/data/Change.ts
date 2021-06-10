import {Speech} from "./Speech";
import {Command} from "./Command";
import {Entrance} from "./Entrance";
import {Character} from "./Character";
import {Monster} from "./Monster";
import {Scroll} from "./Scroll";

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

export type Change = SpeechChange | CommandChange | EntranceChange | ScrollChange;