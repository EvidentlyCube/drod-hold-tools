import {ModelType} from "../common/Enums";

export interface WorldMap {
	modelType: ModelType.WorldMap;
	xml: Element;

	name: string;
}