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

	tilesDataId: number;
	faceDataId: number;

	changes: {
		name?: string
	}
}

export function createNullCharacter(): Character {
	return {
		modelType: ModelType.Character,
		xml: document.createElement('Characters'),

		id: 0,
		name: '',
		extraVars: new PackedVars(),
		commands: [],
		processingSequence: 9999,

		tilesDataId: 0,
		faceDataId: 0,

		changes: {},
	};
}