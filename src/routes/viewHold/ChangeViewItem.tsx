import { ReactElement } from "react";
import { HoldChange, HoldChangeType } from "../../data/datatypes/HoldChange";
import { Hold } from "../../data/datatypes/Hold";
import { HoldRef } from "../../data/references/HoldReference";
import { getBase64DecodedLength, getFormatName } from "../../data/Utils";
import { formatBytes } from "../../utils/Language";

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
		case HoldChangeType.CharacterName:
			{
				const data = hold.characters.get(change.location.characterId);

				if (!data) {
					return invalid(id, "Character Name", "Cannot find data");
				}

				return {
					id,
					type: 'Character Name',
					location: { hold, model: "notApplicable" },
					before: data.name.oldValue,
					after: data.name.finalValue
				};
			}

		case HoldChangeType.DataName:
			{
				const data = hold.datas.get(change.location.dataId);

				if (!data) {
					return invalid(id, "Data Name", "Cannot find data");
				}

				return {
					id,
					type: 'Data Name',
					location: { hold, model: "notApplicable" },
					before: data.name.oldValue,
					after: data.name.finalValue
				};
			}

		case HoldChangeType.DataFile:
			{
				const data = hold.datas.get(change.location.dataId);

				if (!data) {
					return invalid(id, "Data File", "Cannot find data");
				}

				return {
					id,
					type: 'Data File',
					location: { hold, model: "notApplicable" },
					before: `${getFormatName(data.details.oldValue.format)} (${formatBytes(getBase64DecodedLength(data.details.oldValue.rawEncodedData))})`,
					after: `${getFormatName(data.details.finalValue.format)} (${formatBytes(getBase64DecodedLength(data.details.finalValue.rawEncodedData))})`,
				};
			}

		case HoldChangeType.LevelName: {
			const level = hold.levels.get(change.location.levelId);

			if (!level) {
				return invalid(id, "Level Name", "Cannot find level");
			}

			return {
				id,
				type: 'Level Name',
				location: { hold, model: 'notApplicable' },
				before: level.name.oldValue,
				after: level.name.finalValue
			};
		}

		case HoldChangeType.SpeechMessage:
			const speech = hold.speeches.get(change.location.speechId);

			if (!speech) {
				return invalid(id, "Speech Message", "Cannot find speech");
			}

			return {
				id,
				type: 'Speech Message',
				location: speech.$location,
				before: speech.message.oldValue,
				after: speech.message.finalValue
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