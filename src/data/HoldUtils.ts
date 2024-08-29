import { getCommandDataId } from "./CommandUtils";
import { Hold } from "./datatypes/Hold";
import { HoldRefModel } from "./references/HoldReference";

export function getLevelRoomIds(hold: Hold, levelId: number): number[] {
	return hold.rooms.filterToArray(room => room.levelId === levelId).map(room => room.id);
}

export function getMainEntranceId(hold: Hold, levelId: number) {
	const roomIds = new Set(getLevelRoomIds(hold, levelId));

	return hold.entrances.find(entrance => entrance.isMainEntrance && roomIds.has(entrance.roomId))?.id;
}

export function regenerateHoldDataUses(hold: Hold, dataId?: number) {
	if (dataId) {
		hold.datas.getOrError(dataId).$uses.length = 0;
	} else {
		hold.datas.forEach(data => data.$uses.length = 0);
	}

	const isMatch = (inputDataId: number) => !dataId || inputDataId === dataId;

	for (const worldMap of hold.worldMaps.values()) {
		if (worldMap.dataId.newValue && isMatch(worldMap.dataId.newValue)) {
			hold.datas.getOrError(worldMap.dataId.newValue).$uses.push({
				hold,
				model: HoldRefModel.WorldMap,
				worldMapId: worldMap.id
			});
		}
	}

	for (const speech of hold.speeches.values()) {
		if (speech.dataId.newValue && isMatch(speech.dataId.newValue)) {
			hold.datas.getOrError(speech.dataId.newValue).$uses.push({
				hold,
				model: HoldRefModel.Speech,
				speechId: speech.id
			});
		}
	}

	for (const character of hold.characters.values()) {
		if (character.avatarDataId.newValue && isMatch(character.avatarDataId.newValue)) {
			hold.datas.getOrError(character.avatarDataId.newValue).$uses.push({
				hold,
				model: HoldRefModel.CharacterAvatar,
				characterId: character.id
			});
		}
		if (character.tilesDataId.newValue && isMatch(character.tilesDataId.newValue)) {
			hold.datas.getOrError(character.tilesDataId.newValue).$uses.push({
				hold,
				model: HoldRefModel.CharacterTiles,
				characterId: character.id
			});
		}

		if (!character.$commandList) {
			continue;
		}

		for (const command of character.$commandList.$commandsWithData) {
			const dataId = getCommandDataId(command);
			if (dataId && isMatch(dataId)) {
				hold.datas.getOrError(dataId).$uses.push({
					hold,
					model: HoldRefModel.CharacterCommand,
					characterId: character.id,
					commandIndex: command.index
				});
			}
		}
	}

	for (const room of hold.rooms.values()) {
		if (room.dataId && isMatch(room.dataId)) {
			hold.datas.getOrError(room.dataId).$uses.push({
				hold,
				model: HoldRefModel.RoomImage,
				roomId: room.id
			});
		}

		if (room.overheadDataId && isMatch(room.overheadDataId)) {
			hold.datas.getOrError(room.overheadDataId).$uses.push({
				hold,
				model: HoldRefModel.RoomOverheadImage,
				roomId: room.id
			});
		}

		for (const monster of room.$monstersWithDataCommand) {
			if (!monster.$commandList) {
				continue;
			}

			for (const command of monster.$commandList.$commandsWithData) {
				const dataId = getCommandDataId(command);
				if (dataId && isMatch(dataId)) {
					hold.datas.getOrError(dataId).$uses.push({
						hold,
						model: HoldRefModel.MonsterCommand,
						roomId: room.id,
						monsterIndex: monster.$index,
						commandIndex: command.index
					});
				}
			}
		}
	}

	for (const entrance of hold.entrances.values()) {
		if (entrance.dataId.newValue && isMatch(entrance.dataId.newValue)) {
			hold.datas.getOrError(entrance.dataId.newValue).$uses.push({
				hold,
				model: HoldRefModel.EntranceVoiceOver,
				entranceId: entrance.id
			});
		}
	}
}

export function regenerateHoldSpeechLocations(hold: Hold, speechIdToRegenerate?: number) {
	const isMatch = (inputSpeechId: number) => !speechIdToRegenerate || inputSpeechId === speechIdToRegenerate;


	for (const character of hold.characters.values()) {
		if (!character.$commandList) {
			continue;
		}

		for (const command of character.$commandList.$commandsWithSpeech) {
			const { speechId, index } = command;
			if (speechId && isMatch(speechId)) {
				hold.speeches.getOrError(speechId).$location = {
					hold,
					model: HoldRefModel.CharacterCommand,
					characterId: character.id,
					commandIndex: index
				}
			}
		}
	}

	for (const room of hold.rooms.values()) {
		for (const monster of room.$monstersWithSpeechCommand) {
			if (!monster.$commandList) {
				continue;
			}

			for (const command of monster.$commandList.$commandsWithSpeech) {
				const { speechId, index } = command;
				if (speechId && isMatch(speechId)) {
					hold.speeches.getOrError(speechId).$location = {
						hold,
						model: HoldRefModel.MonsterCommand,
						roomId: room.id,
						monsterIndex: monster.$index,
						commandIndex: index
					}
				}
			}
		}
	}
}