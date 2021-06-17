import {Command} from "./Command";
import {ModelType} from "../common/Enums";
import {Character} from "./Character";
import {Monster} from "./Monster";

export interface Speech {
	modelType: ModelType.Speech;
	xml: Element;

	id: number;
	text: string;
	dataId: number;

	moodId: number;
	speakerId: number;
	delay: number;

	isDeleted: boolean;

	changes: {
		text?: string;
	}

	command: Command;
	source?: Character | Monster;

	location?: {
		index: number,
		source: 'monster' | 'character',
		location: string,
		characterName: string,
		speechCustomX: number,
		speechCustomY: number,
		commandName: string,
		levelId: number|undefined
		roomId: number|undefined
	}
}