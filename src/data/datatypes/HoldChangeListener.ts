import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { Hold } from "./Hold";
import { HoldChange, HoldChangeCharacterName, HoldChangeDataFile, HoldChangeDataName, HoldChangeEntranceDataId, HoldChangeEntranceDescription, HoldChangeEntranceShowDescription, HoldChangeLevelName, HoldChangeScrollMessage, HoldChangeSpeechDataId, HoldChangeSpeechMessage, HoldChangeSpeechMood, HoldChangeType } from "./HoldChange";
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
			this.registerEntranceDataIdChange(entrance);
			this.registerEntranceDescriptionChange(entrance);
			this.registerEntranceShowDescriptionChange(entrance);
		})
		hold.levels.forEach(level => {
			this.registerLevelNameChange(level);
		})
		hold.$scrolls.forEach(scroll => {
			this.registerScrollMessageChange(scroll);
		})
		hold.speeches.forEach(speech => {
			this.registerSpeechDataIdChange(speech);
			this.registerSpeechMessageChange(speech);
			this.registerSpeechMoodChange(speech);
		});
	}

	private registerCharacterNameChange(character: HoldCharacter) {
		const { $hold, id, name } = character;

		const change = $hold.$changes.create<HoldChangeCharacterName>({
			type: HoldChangeType.CharacterName,
			location: { characterId: id },
			hasChange: false,
			value: name.newValue
		});

		registerTextChange($hold, change, name);
	}

	private registerDataNameChange(data: HoldData) {
		const { $hold, id, name } = data;

		const change = $hold.$changes.create<HoldChangeDataName>({
			type: HoldChangeType.DataName,
			location: { dataId: id },
			hasChange: false,
			value: name.newValue
		});

		registerTextChange($hold, change, name);
	}

	private registerDataFileChange(data: HoldData) {
		const { $hold, id, details } = data;

		const change = $hold.$changes.create<HoldChangeDataFile>({
			type: HoldChangeType.DataFile,
			location: { dataId: id },
			hasChange: false,
			value: details.newValue
		});

		registerTextChange($hold, change, details);
	}

	private registerEntranceDataIdChange(entrance: HoldEntrance) {
		const { $hold, id, dataId } = entrance;

		const change = $hold.$changes.create<HoldChangeEntranceDataId>({
			type: HoldChangeType.EntranceDataId,
			location: { entranceId: id },
			hasChange: false,
			value: dataId.newValue
		});

		registerTextChange($hold, change, dataId);
	}

	private registerEntranceDescriptionChange(entrance: HoldEntrance) {
		const { $hold, id, description } = entrance;

		const change = $hold.$changes.create<HoldChangeEntranceDescription>({
			type: HoldChangeType.EntranceDescription,
			location: { entranceId: id },
			hasChange: false,
			value: description.newValue
		});

		registerTextChange($hold, change, description);
	}

	private registerEntranceShowDescriptionChange(entrance: HoldEntrance) {
		const { $hold, id, showDescription } = entrance;

		const change = $hold.$changes.create<HoldChangeEntranceShowDescription>({
			type: HoldChangeType.EntranceShowDescription,
			location: { entranceId: id },
			hasChange: false,
			value: showDescription.newValue
		});

		registerTextChange($hold, change, showDescription);
	}

	private registerLevelNameChange(level: HoldLevel) {
		const { $hold, id, name } = level;

		const change = $hold.$changes.create<HoldChangeLevelName>({
			type: HoldChangeType.LevelName,
			location: { levelId: id },
			hasChange: false,
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
			hasChange: false,
			value: message.newValue
		});

		registerTextChange($hold, change, message);
	}

	private registerSpeechDataIdChange(speech: HoldSpeech) {
		const { $hold, id, dataId } = speech;

		const change = $hold.$changes.create<HoldChangeSpeechDataId>({
			type: HoldChangeType.SpeechDataId,
			location: { speechId: id },
			hasChange: false,
			value: dataId.newValue
		});

		registerTextChange($hold, change, dataId);
	}

	private registerSpeechMessageChange(speech: HoldSpeech) {
		const { $hold, id, message } = speech;

		const change = $hold.$changes.create<HoldChangeSpeechMessage>({
			type: HoldChangeType.SpeechMessage,
			location: { speechId: id },
			hasChange: false,
			value: message.newValue
		});

		registerTextChange($hold, change, message);
	}

	private registerSpeechMoodChange(speech: HoldSpeech) {
		const { $hold, id, mood } = speech;

		const change = $hold.$changes.create<HoldChangeSpeechMood>({
			type: HoldChangeType.SpeechMood,
			location: { speechId: id },
			hasChange: false,
			value: mood.newValue
		});

		registerTextChange($hold, change, mood);
	}

}

function registerTextChange(hold: Hold, change: HoldChange, updatableValue: SignalUpdatableValue<any>) {
	updatableValue.onChange.add(props => {
		change.hasChange = props.hasNewValue;
		change.value = props.value;

		if (!props.hasNewValue || props.value === updatableValue.oldValue) {
			hold.$changes.del(change)
		} else {
			hold.$changes.add(change)
		}
	})
}