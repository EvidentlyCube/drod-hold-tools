import {PackedVars} from "../common/PackedVars";
import {Command} from "./Command";
import {ModelType} from "../common/Enums";

export interface Monster {
	modelType: ModelType.Monster;
	xml: Element;

	roomId: number;
	x: number;
	y: number;
	o: number;
	type: number;

	extraVars: PackedVars;
	commands: Command[];
	processingSequence: number;
	isVisible: boolean;
	characterType: number;
}