import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { regenerateHoldDataUses } from "../HoldUtils";
import { Hold } from "./Hold";
import { HoldChange, HoldChangeCharacterAvatarDataId, HoldChangeCharacterName, HoldChangeCharacterTilesDataId, HoldChangeDataFile, HoldChangeDataName, HoldChangeEntranceDataId, HoldChangeEntranceDescription, HoldChangeEntranceShowDescription, HoldChangeHoldPlayer, HoldChangeLevelCreated, HoldChangeLevelName, HoldChangeLevelPlayerId, HoldChangePlayerDeletion, HoldChangePlayerInsertion, HoldChangePlayerName, HoldChangeScrollMessage, HoldChangeSpeechDataId, HoldChangeSpeechMessage, HoldChangeSpeechMood, HoldChangeType, HoldChangeWorldMapName } from "./HoldChange";
import { HoldCharacter } from "./HoldCharacter";
import { HoldData } from "./HoldData";
import { HoldEntrance } from "./HoldEntrance";
import { HoldLevel } from "./HoldLevel";
import { HoldPlayer } from "./HoldPlayer";
import { HoldScroll } from "./HoldRoom";
import { HoldSpeech } from "./HoldSpeech";
import { HoldWorldMap } from "./HoldWorldMap";

export class HoldChangeListener {
	public register(hold: Hold) {
		this.registerHoldPlayerChange(hold);

		hold.characters.forEach(character => {
			this.registerCharacterAvatarDataIdChange(character);
			this.registerCharacterNameChange(character);
			this.registerCharacterTilesDataIdChange(character);
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
			this.registerLevelCreatedChange(level);
			this.registerLevelNameChange(level);
			this.registerLevelPlayerIdChange(level);
		})
		hold.players.forEach(player => this.registerNewPlayer(player));
		hold.$scrolls.forEach(scroll => {
			this.registerScrollMessageChange(scroll);
		})
		hold.speeches.forEach(speech => {
			this.registerSpeechDataIdChange(speech);
			this.registerSpeechMessageChange(speech);
			this.registerSpeechMoodChange(speech);
		});
		hold.worldMaps.forEach(worldMap => {
			this.registerWorldMapNameChange(worldMap);
		});
	}

	public registerNewPlayer(player: HoldPlayer) {
		if (player.$isNewlyAdded) {
			this.registerPlayerInsertion(player);
		} else {
			this.registerPlayerNameChange(player);
			this.registerPlayerDeletion(player);
		}
	}

	private registerHoldPlayerChange(hold: Hold) {
		const change = hold.$changes.create<HoldChangeHoldPlayer>({
			type: HoldChangeType.HoldPlayer,
			location: { },
			hasChange: false,
			value: hold.playerId.newValue
		});

		registerTextChange(hold, change, hold.playerId);
		registerPlayerRestoration(hold, hold.playerId);
	}

	private registerCharacterAvatarDataIdChange(character: HoldCharacter) {
		const { $hold, id, avatarDataId } = character;

		const change = $hold.$changes.create<HoldChangeCharacterAvatarDataId>({
			type: HoldChangeType.CharacterAvatarDataId,
			location: { characterId: id },
			hasChange: false,
			value: avatarDataId.newValue
		});

		registerTextChange($hold, change, avatarDataId);
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

	private registerCharacterTilesDataIdChange(character: HoldCharacter) {
		const { $hold, id, tilesDataId } = character;

		const change = $hold.$changes.create<HoldChangeCharacterTilesDataId>({
			type: HoldChangeType.CharacterTilesDataId,
			location: { characterId: id },
			hasChange: false,
			value: tilesDataId.newValue
		});

		registerTextChange($hold, change, tilesDataId);
		registerDataChange($hold, tilesDataId);
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
		registerDataChange($hold, dataId);
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

	private registerLevelCreatedChange(level: HoldLevel) {
		const { $hold, id, createdTimestamp } = level;

		const change = $hold.$changes.create<HoldChangeLevelCreated>({
			type: HoldChangeType.LevelCreated,
			location: { levelId: id },
			hasChange: false,
			value: createdTimestamp.newValue
		});

		registerTextChange($hold, change, createdTimestamp);
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

	private registerLevelPlayerIdChange(level: HoldLevel) {
		const { $hold, id, playerId } = level;

		const change = $hold.$changes.create<HoldChangeLevelPlayerId>({
			type: HoldChangeType.LevelPlayerId,
			location: { levelId: id },
			hasChange: false,
			value: playerId.newValue
		});

		registerTextChange($hold, change, playerId);
		registerPlayerRestoration($hold, playerId);
	}

	private registerPlayerDeletion(player: HoldPlayer) {
		const { $hold, id, $isDeleted } = player;

		const change = $hold.$changes.create<HoldChangePlayerDeletion>({
			type: HoldChangeType.PlayerDeletion,
			location: { playerId: id },
			hasChange: false,
			value: $isDeleted.newValue
		});

		registerTextChange($hold, change, $isDeleted);
	}


	private registerPlayerInsertion(player: HoldPlayer) {
		const { $hold, id, $isDeleted, name } = player;

		const change = $hold.$changes.create<HoldChangePlayerInsertion>({
			type: HoldChangeType.PlayerInsertion,
			location: { playerId: id },

			hasChange: true,
			value: {
				gidCreated: player.gidCreated,
				gidOriginalName: player.gidOriginalName,
				name: player.name.newValue
			}
		});

		name.onChange.add(({value}) => {
			change.value.name = value;
			$hold.$changes.add(change);
		});

		$hold.$changes.add(change);

		$isDeleted.onChange.add(props => {
			if (props.value === true) {
				$hold.players.del(id);
				$hold.$changes.del(change);
			}
		})
	}

	private registerPlayerNameChange(player: HoldPlayer) {
		const { $hold, id, name } = player;

		const change = $hold.$changes.create<HoldChangePlayerName>({
			type: HoldChangeType.PlayerName,
			location: { playerId: id },
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
		registerDataChange($hold, dataId);
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

	private registerWorldMapNameChange(worldMap: HoldWorldMap) {
		const { $hold, id, name } = worldMap;

		const change = $hold.$changes.create<HoldChangeWorldMapName>({
			type: HoldChangeType.WorldMapName,
			location: { worldMapId: id },
			hasChange: false,
			value: name.newValue
		});

		registerTextChange($hold, change, name);
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

function registerDataChange(hold: Hold, updatableValue: SignalUpdatableValue<any>) {
	updatableValue.onChange.add(({ value, previousValue }) => {
		if (previousValue) {
			regenerateHoldDataUses(hold, previousValue);
		}
		if (value && value !== previousValue) {
			regenerateHoldDataUses(hold, value);
		}
	})
}

function registerPlayerRestoration(hold: Hold, updatableValue: SignalUpdatableValue<number>) {
	updatableValue.onChange.add(({ value }) => {
		const player = hold.players.get(value);

		player?.$isDeleted.unset();
	})
}