import { ReactElement } from "react";
import { HoldChange, HoldChangeType } from "../../data/datatypes/HoldChange";
import { Hold } from "../../data/datatypes/Hold";
import { HoldRef } from "../../data/references/HoldReference";

export interface ChangeViewItem {
	id: string;
	type: string;
	location?: HoldRef;
	before: ReactElement[] | ReactElement | string | number;
	after: ReactElement[] | ReactElement | string | number;
}

export function changeToViewItem(change: HoldChange, hold: Hold): ChangeViewItem {
	const id = `${change.type}-${JSON.stringify(change.location)}`;

	switch (change.type) {
		case HoldChangeType.SpeechMessage:
			const speech = hold.speeches.get(change.location.speechId);

			if (!speech) {
				return invalid(id, "Speech Message", "Cannot find speech");
			}

			return {
				id,
				type: 'Speech Message',
				location: speech.$location,
				before: speech.message.oldText,
				after: speech.message.newText ?? ''
			};

		case HoldChangeType.DataName:
			const data = hold.datas.get(change.location.dataId);

			if (!data) {
				return invalid(id, "Data Name", "Cannot find data");
			}

			return {
				id,
				type: 'Data Name',
				location: { hold, model: "notApplicable" },
				before: data.name.oldText,
				after: data.name.newText ?? ''
			};

		default:
			return invalid(id, "UNKNOWN", "Unknown change: " + JSON.stringify(change));
	}
}


function invalid(id: string, type: string, error: string): ChangeViewItem {
	return {
		id,
		type,
		before: "# ERROR #",
		after: error
	}
}