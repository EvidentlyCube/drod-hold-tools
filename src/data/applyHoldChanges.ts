import { Hold } from "./datatypes/Hold";
import { HoldChangeType } from "./datatypes/HoldChange";

export function applyHoldChanges(hold: Hold) {
	for (const change of hold.$changes.list.values()) {
		switch (change.type) {
			case HoldChangeType.CharacterName:
				hold.characters.get(change.location.characterId)!.name.set(change.hasChange, change.value!); // @FIXME !
				break;

			case HoldChangeType.DataName:
				hold.datas.get(change.location.dataId)!.name.set(change.hasChange, change.value!);  // @FIXME !
				break;

			case HoldChangeType.DataFile:
				hold.datas.get(change.location.dataId)!.details.set(change.hasChange, change.value!);  // @FIXME !
				break;

			case HoldChangeType.EntranceDescription:
				hold.entrances.get(change.location.entranceId)!.description.set(change.hasChange, change.value!); // @FIXME !
				break;

			case HoldChangeType.EntranceShowDescription:
				hold.entrances.get(change.location.entranceId)!.showDescription.set(change.hasChange, change.value!);  // @FIXME !
				break;

			case HoldChangeType.LevelName:
				hold.levels.get(change.location.levelId)!.name.set(change.hasChange, change.value!); // @FIXME !
				break;

			case HoldChangeType.ScrollMessage:
				hold.rooms.get(change.location.roomId)!.scrolls
					.find(scroll => scroll.x === change.location.x && scroll.y === change.location.y)!
					.message.set(change.hasChange, change.value!); // @FIXME !
				break;

			case HoldChangeType.SpeechMessage:
				hold.speeches.get(change.location.speechId)!.message.set(change.hasChange, change.value!);  // @FIXME !
				break;

			case HoldChangeType.SpeechMood:
				hold.speeches.get(change.location.speechId)!.mood.set(change.hasChange, change.value!);  // @FIXME !
				break;

		}
	}
}