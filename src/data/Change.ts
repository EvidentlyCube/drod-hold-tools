import {Speech} from "./Speech";
import {Command} from "./Command";

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

export type Change = SpeechChange | CommandChange;