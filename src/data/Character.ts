import {Command} from "./Command";

export interface Character {
	xml: Element;

	name: string;
	commands: Command[];
	processingSequence: number;
}