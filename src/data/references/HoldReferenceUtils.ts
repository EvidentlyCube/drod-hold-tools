import { HoldScroll } from "../datatypes/HoldRoom";
import { HoldRefModel, HoldRefScroll } from "./HoldReference";

export function getScrollRef(scroll: HoldScroll): HoldRefScroll {
	return {
		hold: scroll.$room.$hold,
		model: HoldRefModel.Scroll,
		roomId: scroll.$room.id,
		x: scroll.x,
		y: scroll.y,
	}
}
