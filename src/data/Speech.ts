import {Command} from "./Command";

export interface Speech {
	id: number;
	xml: Element;
	text: string;
	dataId: number;

	moodId: number;
	speakerId: number;
	delay: number;

	isDeleted?: true;

	changes: {
		text?: string;
	}

	command?: Command;

	location?: {
		source: 'monster' | 'character',
		location: string,
		characterName: string,
		x: number,
		y: number,
		commandName: string,
	}
}