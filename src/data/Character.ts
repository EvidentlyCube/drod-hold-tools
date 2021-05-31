import {Command} from "./Command";

export interface Character {
	xml: Element;

	id: number;

	name: string;
	commands: Command[];
	processingSequence: number;
}