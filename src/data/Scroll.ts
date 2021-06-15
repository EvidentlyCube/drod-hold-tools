import {ModelType} from "../common/Enums";

export interface Scroll {
	modelType: ModelType.Scroll;
	xml: Element;

	id: string;
	roomId: number;
	x: number;
	y: number;
	text: string;

	changes: {
		text?: string
	}
}