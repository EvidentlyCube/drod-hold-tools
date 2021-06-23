import {ModelType} from "../common/Enums";

export interface Entrance {
	modelType: ModelType.Entrance;
	xml: Element;

	id: number;

	roomId: number;
	description: string;
	isMainEntrance: boolean;
	showDescription: boolean;
	x: number;
	y: number;
	dataId: number;

	changes: {
		description?: string;
	}
}