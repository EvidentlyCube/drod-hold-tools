import {Hold} from "../data/Hold";
import {Change} from "../data/Change";

export const HoldUtils = {
	addChange(hold: Hold, change: Change) {
		for(const existingChange of hold.changes) {
			if (existingChange.model === change.model) {
				return;
			}
		}

		hold.changes.push(change);
	}
};