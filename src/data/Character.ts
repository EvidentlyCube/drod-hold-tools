import {Command} from "./Command";
import {PackedVars} from "../common/PackedVars";

export interface Character {
	xml: Element;

	id: number;

	name: string;

	extraVars: PackedVars;
	commands: Command[];
	processingSequence: number;
}