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

export function createNullMonster(): Monster {
	return {
		modelType: ModelType.Monster,
		xml: document.createElement('Monsters'),

		roomId: 0,
		x: 0,
		y: 0,
		o: 0,
		type: 0,

		extraVars: new PackedVars(),
		commands: [],
		processingSequence: 9999,

		isVisible: true,
		characterType: 0,
	};
}