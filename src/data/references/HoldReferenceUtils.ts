import { HoldScroll } from "../datatypes/HoldRoom";
import { HoldRefScroll } from "./HoldReference";

export function getScrollRef(scroll: HoldScroll): HoldRefScroll {
	return {
		hold: scroll.$room.$hold,
		model: 'scroll',
		roomId: scroll.$room.id,
		x: scroll.x,
		y: scroll.y,
	}
}
