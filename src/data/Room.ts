import {Point} from "../common/CommonTypes";
import {Monster} from "./Monster";
import {Scroll} from "./Scroll";
import {ModelType} from "../common/Enums";

export interface Room {
	modelType: ModelType.Room;
	xml: Element;

	roomId: number;
	levelId: number;

	roomX: number;
	roomY: number;

	checkpoints: Point[];
	monsters: Monster[];
	scrolls: Scroll[];

	characterCount: number;
}