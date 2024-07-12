import { Hold } from "./datatypes/Hold";
import { HoldChangeType } from "./datatypes/HoldChange";

export function applyHoldChanges(hold: Hold) {
	for (const change of hold.$changes.list.values()) {
		switch (change.type) {
			case HoldChangeType.CharacterName:
				hold.characters.getOrError(change.location.characterId).name.set(change.hasChange, change.value);
				break;

			case HoldChangeType.DataName:
				hold.datas.getOrError(change.location.dataId).name.set(change.hasChange, change.value);
				break;

			case HoldChangeType.DataFile:
				hold.datas.getOrError(change.location.dataId).details.set(change.hasChange, change.value);
				break;

			case HoldChangeType.EntranceDataId:
				hold.entrances.getOrError(change.location.entranceId).dataId.set(change.hasChange, change.value);
				break;

			case HoldChangeType.EntranceDescription:
				hold.entrances.getOrError(change.location.entranceId).description.set(change.hasChange, change.value);
				break;

			case HoldChangeType.EntranceShowDescription:
				hold.entrances.getOrError(change.location.entranceId).showDescription.set(change.hasChange, change.value);
				break;

			case HoldChangeType.LevelName:
				hold.levels.getOrError(change.location.levelId).name.set(change.hasChange, change.value);
				break;

			case HoldChangeType.ScrollMessage: {
				const scroll = hold.rooms.getOrError(change.location.roomId).scrolls
					.find(scroll => scroll.x === change.location.x && scroll.y === change.location.y);

				if (scroll) {
					scroll.message.set(change.hasChange, change.value);
				}
			}
				break;

			case HoldChangeType.SpeechMessage:
				hold.speeches.getOrError(change.location.speechId).message.set(change.hasChange, change.value);
				break;

			case HoldChangeType.SpeechDataId:
				hold.speeches.getOrError(change.location.speechId).dataId.set(change.hasChange, change.value);
				break;

			case HoldChangeType.SpeechMood:
				hold.speeches.getOrError(change.location.speechId).mood.set(change.hasChange, change.value);
				break;

			case HoldChangeType.WorldMapName:
				hold.worldMaps.getOrError(change.location.worldMapId).name.set(change.hasChange, change.value);
				break;

		}
	}
}