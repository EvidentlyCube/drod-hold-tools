import {ModelType} from "../common/Enums";

export interface Scroll {
	modelType: ModelType.Scroll;
	xml: Element;

	id: number;
	roomId: number;
	x: number;
	y: number;
	text: string;

	changes: {
		text?: string
	}
}