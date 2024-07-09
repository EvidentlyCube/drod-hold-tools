import { ReactElement } from "react";
import { HoldChange, HoldChangeType } from "../../data/datatypes/HoldChange";
import { Hold } from "../../data/datatypes/Hold";
import { HoldRef } from "../../data/references/HoldReference";
import { getBase64DecodedLength, getFormatName, getShowDescriptionName } from "../../data/Utils";
import { formatBytes } from "../../utils/Language";
import { MoodIdToName } from "../../data/DrodEnums";

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
				const character = hold.characters.get(change.location.characterId);

				if (!character) {
					return invalid(id, "Character Name", "Cannot find data");
				}

				return {
					id,
					type: 'Character Name',
					location: { hold, model: "character", characterId: character.id },
					before: character.name.oldValue,
					after: character.name.finalValue
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
					location: { hold, model: "data", dataId: data.id },
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

		case HoldChangeType.EntranceDescription: {
			const entrance = hold.entrances.get(change.location.entranceId);

			if (!entrance) {
				return invalid(id, "Entrance Description", "Cannot find entrance");
			}

			return {
				id,
				type: 'Entrance Description',
				location: { hold, model: 'room', roomId: entrance.roomId },
				before: <div className="is-white-space-pre">{entrance.description.oldValue.replace(/\r/g, "\n")}</div>,
				after: <div className="is-white-space-pre">{entrance.description.finalValue}</div>,
			};
		}

		case HoldChangeType.EntranceShowDescription: {
			const entrance = hold.entrances.get(change.location.entranceId);

			if (!entrance) {
				return invalid(id, "Entrance Show Description", "Cannot find entrance");
			}

			return {
				id,
				type: 'Entrance Show Description',
				location: { hold, model: 'room', roomId: entrance.roomId },
				before: getShowDescriptionName(entrance.showDescription.oldValue),
				after: getShowDescriptionName(entrance.showDescription.finalValue),
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

		case HoldChangeType.ScrollMessage: {
			const room = hold.rooms.get(change.location.roomId);

			if (!room) {
				return invalid(id, "Scroll Message", "Cannot find room");
			}

			const scroll = room.scrolls
				.find(scroll => scroll.x === change.location.x && scroll.y === change.location.y);

			if (!scroll) {
				return invalid(id, "Scroll Message", "Cannot find scroll");
			}

			return {
				id,
				type: 'Scroll Message',
				location: scroll.$scrollRef,
				before: <div className="is-white-space-pre">{scroll.message.oldValue.replace(/\r/g, "\n")}</div>,
				after: <div className="is-white-space-pre">{scroll.message.finalValue}</div>,
			};
		}

		case HoldChangeType.SpeechMessage: {
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
		}

		case HoldChangeType.SpeechMood: {
			const speech = hold.speeches.get(change.location.speechId);

			if (!speech) {
				return invalid(id, "Speech Mood", "Cannot find speech");
			}

			return {
				id,
				type: 'Speech Mood',
				location: speech.$location,
				before: MoodIdToName.get(speech.mood.oldValue) ?? `Invalid mood ${speech.mood.oldValue}`,
				after: MoodIdToName.get(speech.mood.finalValue) ?? `Invalid mood ${speech.mood.finalValue}`,
			};
		}


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