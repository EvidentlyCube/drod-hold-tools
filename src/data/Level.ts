import {Entrance} from "./Entrance";

export interface Level {
	xml: Element;

	name: string;

	entranceX: number;
	entranceY: number;

	entrances: Entrance[];
}