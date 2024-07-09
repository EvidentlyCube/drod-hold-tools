import { Hold } from "./datatypes/Hold";
import { HoldChangeType } from "./datatypes/HoldChange";

export function applyHoldChanges(hold: Hold) {
	for (const change of hold.$changes.list.values()) {
		switch (change.type) {
			case HoldChangeType.CharacterName:
				hold.characters.get(change.location.characterId)!.name.newValue = change.value;
				break;

			case HoldChangeType.DataName:
				hold.datas.get(change.location.dataId)!.name.newValue = change.value;
				break;

			case HoldChangeType.DataFile:
				hold.datas.get(change.location.dataId)!.details.newValue = change.value;
				break;

			case HoldChangeType.EntranceDescription:
				hold.entrances.get(change.location.entranceId)!.description.newValue = change.value;
				break;

			case HoldChangeType.LevelName:
				hold.levels.get(change.location.levelId)!.name.newValue = change.value;
				break;

			case HoldChangeType.ScrollMessage:
				hold.rooms.get(change.location.roomId)!.scrolls
					.find(scroll => scroll.x === change.location.x && scroll.y === change.location.y)!
					.message.newValue = change.value;
				break;

			case HoldChangeType.SpeechMessage:
				hold.speeches.get(change.location.speechId)!.message.newValue = change.value;
				break;

		}
	}
}