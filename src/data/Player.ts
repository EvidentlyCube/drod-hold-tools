import {ModelType} from "../common/Enums";

export interface Player {
	modelType: ModelType.Player;
	xml: Element;

	id: number;
	name: string;

	isNew: boolean;
	isDeleted: boolean;

	changes: {
		name?: string;
	}
}

export function createNullPlayer(): Player {
	return {
		modelType: ModelType.Player,
		xml: document.createElement('Players'),

		id: 0,
		name: '',

		isNew: true,
		isDeleted: false,

		changes: {}
	};
}