import { ReactElement } from "react";
import { HoldChange, HoldChangeType } from "../../data/datatypes/HoldChange";
import { Hold } from "../../data/datatypes/Hold";

export interface ChangeViewItem {
	id: string;
	type: string;
	location: string;
	before: ReactElement[] | ReactElement | string | number;
	after: ReactElement[] | ReactElement | string | number;
}

export function changeToViewItem(change: HoldChange, hold: Hold): ChangeViewItem {
	const id = `${change.type}-${change.id}-${change.index}`;

	switch (change.type) {
		case HoldChangeType.SpeechMessage:
			const speech = hold.speeches.get(change.id);

			if (!speech) {
				return invalid(id, "Speech Message", "Cannot find speech");
			}

			return {
				id,
				type: 'Speech Message',
				location: "<@fixme>",
				before: speech.message.text,
				after: speech.message.newText ?? ''
			};
		default:
			return invalid(id, "UNKNOWN", "Unknown change: " + JSON.stringify(change));
	}
}


function invalid(id: string, type: string, error: string): ChangeViewItem {
	return {
		id,
		type,
		location: "# ERROR #",
		before: "# ERROR #",
		after: error
	}
}