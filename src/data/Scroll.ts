import {ModelType} from "../common/Enums";

export interface Scroll {
	modelType: ModelType.Scroll;
	xml: Element;

	x: number;
	y: number;
	text: string;
}