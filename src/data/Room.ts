import {Point} from "../common/CommonTypes";
import {Monster} from "./Monster";
import {Scroll} from "./Scroll";

export interface Room {
	xml: Element;

	levelId: number;

	roomX: number;
	roomY: number;

	checkpoints: Point[];
	monsters: Monster[];
	scrolls: Scroll[];
}