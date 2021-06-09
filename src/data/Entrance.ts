import {ModelType} from "../common/Enums";

export interface Entrance {
	modelType: ModelType.Entrance;
	xml: Element;

	id: number;

	roomId: number;
	description: string;
	isMainEntrance: boolean;

	changes: {
		description?: string;
	}
}