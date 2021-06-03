import {PackedVars} from "../common/PackedVars";
import {Command} from "./Command";

export interface Monster {
	xml: Element;

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