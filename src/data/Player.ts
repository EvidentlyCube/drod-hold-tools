import {ModelType} from "../common/Enums";

export interface Player {
	modelType: ModelType.Player;
	xml: Element;
	name: string;
}

export function createNullPlayer(): Player {
	return {
		modelType: ModelType.Player,
		name: '',
		xml: document.createElement('Players'),
	};
}