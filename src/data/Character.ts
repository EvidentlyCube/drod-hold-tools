import {Command} from "./Command";
import {PackedVars} from "../common/PackedVars";
import {ModelType} from "../common/Enums";

export interface Character {
	modelType: ModelType.Character;
	xml: Element;

	id: number;

	name: string;

	extraVars: PackedVars;
	commands: Command[];
	processingSequence: number;
}