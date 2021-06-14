import {Entrance} from "./Entrance";
import {ModelType} from "../common/Enums";

export interface Level {
	modelType: ModelType.Level;
	xml: Element;

	id: number;
	playerId: number;
	index: number;
	name: string;
	dateCreated: Date;

	entranceX: number;
	entranceY: number;

	entrances: Entrance[];

	changes: {
		name?: string,
		playerId?: number,
		dateCreated?: Date
	}
}