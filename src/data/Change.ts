import {Speech} from "./Speech";
import {Command} from "./Command";
import {Entrance} from "./Entrance";

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

export type Change = SpeechChange | CommandChange | EntranceChange;