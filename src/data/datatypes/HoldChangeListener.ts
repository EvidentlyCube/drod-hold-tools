import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { Hold } from "./Hold";
import { HoldChange, HoldChangeCharacterName, HoldChangeDataFile, HoldChangeDataName, HoldChangeEntranceDescription, HoldChangeLevelName, HoldChangeScrollMessage, HoldChangeSpeechMessage, HoldChangeType } from "./HoldChange";
import { HoldCharacter } from "./HoldCharacter";
import { HoldData } from "./HoldData";
import { HoldEntrance } from "./HoldEntrance";
import { HoldLevel } from "./HoldLevel";
import { HoldScroll } from "./HoldRoom";
import { HoldSpeech } from "./HoldSpeech";

export class HoldChangeListener {
	public register(hold: Hold) {
		hold.characters.forEach(character => {
			this.registerCharacterNameChange(character);
		});
		hold.datas.forEach(data => {
			this.registerDataNameChange(data);
			this.registerDataFileChange(data);
		});
		hold.entrances.forEach(entrance => {
			this.registerEntranceDescriptionChange(entrance);
		})
		hold.levels.forEach(level => {
			this.registerLevelNameChange(level);
		})
		hold.$scrolls.forEach(scroll => {
			this.registerScrollMessageChange(scroll);
		})
		hold.speeches.forEach(speech => {
			this.registerSpeechMessageChange(speech);
		});
	}

	private registerCharacterNameChange(character: HoldCharacter) {
		const { $hold, id, name } = character;

		const change = $hold.$changes.create<HoldChangeCharacterName>({
			type: HoldChangeType.CharacterName,
			location: { characterId: id },
			value: name.newValue
		});

		registerTextChange($hold, change, name);
	}

	private registerDataNameChange(data: HoldData) {
		const { $hold, id, name } = data;

		const change = $hold.$changes.create<HoldChangeDataName>({
			type: HoldChangeType.DataName,
			location: { dataId: id },
			value: name.newValue
		});

		registerTextChange($hold, change, name);
	}

	private registerDataFileChange(data: HoldData) {
		const { $hold, id, details } = data;

		const change = $hold.$changes.create<HoldChangeDataFile>({
			type: HoldChangeType.DataFile,
			location: { dataId: id },
			value: details.newValue
		});

		registerTextChange($hold, change, details);
	}

	private registerEntranceDescriptionChange(entrance: HoldEntrance) {
		const { $hold, id, description } = entrance;

		const change = $hold.$changes.create<HoldChangeEntranceDescription>({
			type: HoldChangeType.EntranceDescription,
			location: { entranceId: id },
			value: description.newValue
		});

		registerTextChange($hold, change, description);
	}

	private registerLevelNameChange(level: HoldLevel) {
		const { $hold, id, name } = level;

		const change = $hold.$changes.create<HoldChangeLevelName>({
			type: HoldChangeType.LevelName,
			location: { levelId: id },
			value: name.newValue
		});

		registerTextChange($hold, change, name);
	}

	private registerScrollMessageChange(scroll: HoldScroll) {
		const { $room, x, y, message } = scroll;
		const { $hold } = $room;

		const change = $hold.$changes.create<HoldChangeScrollMessage>({
			type: HoldChangeType.ScrollMessage,
			location: { roomId: $room.id, x, y },
			value: message.newValue
		});

		registerTextChange($hold, change, message);
	}

	private registerSpeechMessageChange(speech: HoldSpeech) {
		const { $hold, id, message } = speech;

		const change = $hold.$changes.create<HoldChangeSpeechMessage>({
			type: HoldChangeType.SpeechMessage,
			location: { speechId: id },
			value: message.newValue
		});

		registerTextChange($hold, change, message);
	}

}

function registerTextChange(hold: Hold, change: HoldChange, updatableValue: SignalUpdatableValue<any>) {
	updatableValue.onChange.add(newValue => {
		change.value = newValue;

		if (newValue === undefined || newValue === updatableValue.oldValue) {
			hold.$changes.del(change)
		} else {
			hold.$changes.add(change)
		}
	})
}