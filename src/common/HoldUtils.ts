import {Hold} from "../data/Hold";
import {Change} from "../data/Change";

export const HoldUtils = {
	addChange(hold: Hold, change: Change) {
		for (const existingChange of hold.changes) {
			if (existingChange.type === change.type && existingChange.model === change.model) {
				change.changes = {
					...existingChange.changes,
					...change.changes,
				};
				hold.changes.delete(existingChange);
				break;
			}
		}

		for (const field of Object.keys(change.changes)) {
			if (!(change.changes as any)[field]) {
				delete (change.changes as any)[field];
			}
		}

		if (Object.keys(change.changes).length > 0) {
			hold.changes.add(change);
		}
	},
};