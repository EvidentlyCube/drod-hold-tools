import {Entrance} from "./Entrance";
import {ModelType} from "../common/Enums";

export interface Level {
	modelType: ModelType.Level;
	xml: Element;

	name: string;

	entranceX: number;
	entranceY: number;

	entrances: Entrance[];
}