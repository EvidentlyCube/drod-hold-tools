import { doesCommandUseCharacter, doesCommandUseVariable, getCommandDataId } from "./CommandUtils";
import { Hold } from "./datatypes/Hold";
import { HoldSpeech } from "./datatypes/HoldSpeech";
import { CUSTOM_CHARACTER_FIRST, UINT_MINUS_1 } from "./DrodCommonTypes";
import { Mood, ScriptCommandType, Speaker } from "./DrodEnums";
import { HoldRef, HoldRefModel } from "./references/HoldReference";
import { stringToWCharBase64 } from "./Utils";

export function getLevelRoomIds(hold: Hold, levelId: number): number[] {
	return hold.rooms.filterToArray(room => room.levelId === levelId).map(room => room.id);
}

export function getMainEntranceId(hold: Hold, levelId: number) {
	const roomIds = new Set(getLevelRoomIds(hold, levelId));

	return hold.entrances.find(entrance => entrance.isMainEntrance && roomIds.has(entrance.roomId))?.id;
}

export function regenerateHoldDataUses(hold: Hold, filteredByDataId?: number) {
	const logMissingData = (dataId: number | undefined, problem: string, ref: HoldRef) => {
		if (dataId && !hold.datas.has(dataId)) {
			hold.registerProblem({ problem, ref });
		}
	}
	if (filteredByDataId) {
		hold.datas.getOrError(filteredByDataId).$uses.length = 0;
	} else {
		hold.datas.forEach(data => data.$uses.length = 0);
	}

	const isMatch = (inputDataId: number) => inputDataId === filteredByDataId || (inputDataId && hold.datas.has(inputDataId));

	for (const worldMap of hold.worldMaps.values()) {
		const ref: HoldRef = {
			hold,
			model: HoldRefModel.WorldMap,
			worldMapId: worldMap.id
		};

		logMissingData(worldMap.dataId.newValue, `World map image data points to a data that does not exist.`, ref);
		if (worldMap.dataId.newValue && isMatch(worldMap.dataId.newValue)) {
			hold.datas.getOrError(worldMap.dataId.newValue).$uses.push(ref);
		}
	}

	for (const speech of hold.speeches.values()) {
		const ref: HoldRef = {
			hold,
			model: HoldRefModel.Speech,
			speechId: speech.id
		};
		logMissingData(speech.dataId.newValue, `Speech voice line uses data that does not exist.`, ref);
		if (speech.dataId.newValue && isMatch(speech.dataId.newValue)) {
			hold.datas.getOrError(speech.dataId.newValue).$uses.push(ref);
		}
	}

	for (const character of hold.characters.values()) {
		let avatarRef: HoldRef = {
			hold,
			model: HoldRefModel.CharacterAvatar,
			characterId: character.id
		};
		logMissingData(character.avatarDataId.newValue, `Character avatar uses data that does not exist.`, avatarRef);
		if (character.avatarDataId.newValue && isMatch(character.avatarDataId.newValue)) {
			hold.datas.getOrError(character.avatarDataId.newValue).$uses.push(avatarRef);
		}

		const tilesRef: HoldRef = {
			hold,
			model: HoldRefModel.CharacterTiles,
			characterId: character.id
		}
		logMissingData(character.tilesDataId.newValue, `Character tiles use data that does not exist.`, tilesRef);
		if (character.tilesDataId.newValue && isMatch(character.tilesDataId.newValue)) {
			hold.datas.getOrError(character.tilesDataId.newValue).$uses.push(tilesRef);
		}

		if (!character.$commandList) {
			continue;
		}

		for (const command of character.$commandList.$commandsWithData) {
			const dataId = getCommandDataId(command);
			const ref: HoldRef = {
				hold,
				model: HoldRefModel.CharacterCommand,
				characterId: character.id,
				commandIndex: command.index
			};
			logMissingData(dataId, `Character command uses data that does not exist.`, ref);

			if (dataId && isMatch(dataId)) {
				hold.datas.getOrError(dataId).$uses.push(ref);
			}
		}
	}

	for (const room of hold.rooms.values()) {
		const imageRef: HoldRef = {
			hold,
			model: HoldRefModel.RoomImage,
			roomId: room.id
		};
		logMissingData(room.dataId, `Room image uses data that does not exist.`, imageRef);
		if (room.dataId && isMatch(room.dataId)) {
			hold.datas.getOrError(room.dataId).$uses.push(imageRef);
		}

		const overheadRef: HoldRef = {
			hold,
			model: HoldRefModel.RoomOverheadImage,
			roomId: room.id
		};
		logMissingData(room.dataId, `Room overhead image uses data that does not exist.`, overheadRef);
		if (room.overheadDataId && isMatch(room.overheadDataId)) {
			hold.datas.getOrError(room.overheadDataId).$uses.push(overheadRef);
		}

		for (const monster of room.$monstersWithDataCommand) {
			if (!monster.$commandList) {
				continue;
			}

			for (const command of monster.$commandList.$commandsWithData) {
				const dataId = getCommandDataId(command);
				const ref: HoldRef = {
					hold,
					model: HoldRefModel.MonsterCommand,
					roomId: room.id,
					monsterIndex: monster.$index,
					commandIndex: command.index
				};
				logMissingData(dataId, `Monster command uses data that does not exist.`, ref);
				if (dataId && isMatch(dataId)) {
					hold.datas.get(dataId)?.$uses.push(ref);
				}
			}
		}
	}

	for (const entrance of hold.entrances.values()) {
		const ref: HoldRef = {
			hold,
			model: HoldRefModel.EntranceVoiceOver,
			entranceId: entrance.id
		};
		logMissingData(filteredByDataId, `Entrance voice line uses data that does not exist.`, ref);
		if (entrance.dataId.newValue && isMatch(entrance.dataId.newValue)) {
			hold.datas.getOrError(entrance.dataId.newValue).$uses.push(ref);
		}
	}
}

export function regenerateHoldCharacterUses(hold: Hold, characterId: number) {
	const regeneratedCharacter = hold.characters.getOrError(characterId);

	regeneratedCharacter.$uses.length = 0;

	for (const speech of hold.speeches.values()) {
		if (speech.character === characterId) {
			regeneratedCharacter.$uses.push({
				hold,
				model: HoldRefModel.Speech,
				speechId: speech.id
			});
		}
	}

	for (const character of hold.characters.values()) {
		if (!character.$commandList) {
			continue;
		}

		for (const command of character.$commandList.commands) {
			if (doesCommandUseCharacter(command, regeneratedCharacter)) {
				regeneratedCharacter.$uses.push({
					hold,
					model: HoldRefModel.CharacterCommand,
					characterId: character.id,
					commandIndex: command.index
				});
			}
		}
	}

	for (const room of hold.rooms.values()) {
		for (const monster of room.monsters) {
			if (monster.$characterTypeId === characterId) {
				regeneratedCharacter.$uses.push({
					hold,
					model: HoldRefModel.MonsterCharacterType,
					roomId: room.id,
					monsterIndex: monster.$index
				});
			}

			if (!monster.$commandList) {
				continue;
			}

			for (const command of monster.$commandList.commands) {
				if (doesCommandUseCharacter(command, regeneratedCharacter)) {
					regeneratedCharacter.$uses.push({
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
}

export function regenerateHoldVariableUses(hold: Hold, variableId: number) {
	const variable = hold.variables.getOrError(variableId);

	variable.$uses.length = 0;

	// CHECK ALL CUSTOM CHARACTERS
	for (const character of hold.characters.values()) {
		if (!character.$commandList) {
			continue;
		}

		for (const command of character.$commandList.commands) {
			const { speechId, index } = command;

			if (variable.isUsedInText(hold.speeches.get(speechId.newValue)?.message.newValue ?? "")) {
				variable.$uses.push({
					model: HoldRefModel.Speech,
					speechId: speechId.newValue,
					hold
				});
			}

			if (doesCommandUseVariable(command, variable)) {
				variable.$uses.push({
					model: HoldRefModel.CharacterCommand,
					characterId: character.id,
					commandIndex: index,
					hold,
				});
			}
		}
	}

	// ENTRANCES
	for (const entrance of hold.entrances.values()) {
		if (variable.isUsedInText(entrance.description.newValue)) {
			variable.$uses.push({
				model: HoldRefModel.Entrance,
				entranceId: entrance.id,
				hold,
			})
		}
	}

	// CHECK ROOMS - CHARACTERS & SCROLLS
	for (const room of hold.rooms.values()) {
		for (const scroll of hold.$scrolls) {
			if (variable.isUsedInText(scroll.message.newValue)) {
				variable.$uses.push(scroll.$scrollRef)
			}
		}

		for (const monster of room.$monstersWithCommands) {
			if (!monster.$commandList) {
				continue;
			}

			for (const command of monster.$commandList.commands) {
				const { speechId, index } = command;

				if (variable.isUsedInText(hold.speeches.get(speechId.newValue)?.message.newValue ?? "")) {
					variable.$uses.push({
						model: HoldRefModel.Speech,
						speechId: speechId.newValue,
						hold
					});
				}

				if (doesCommandUseVariable(command, variable)) {
					variable.$uses.push({
						model: HoldRefModel.MonsterCommand,
						roomId: room.id,
						monsterIndex: monster.$index,
						commandIndex: index,
						hold,
					});
				}
			}
		}
	}

	// HOLD ENDING
	if (variable.isUsedInText(hold.endHoldMessage.newValue)) {
		variable.$uses.push({
			model: HoldRefModel.HoldEndMessage,
			hold
		})
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
			if (speechId.newValue && isMatch(speechId.newValue)) {
				hold.speeches.getOrError(speechId.newValue).$location = {
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
				const ref: HoldRef = {
					hold,
					model: HoldRefModel.MonsterCommand,
					roomId: room.id,
					monsterIndex: monster.$index,
					commandIndex: index
				};

				if (speechId.newValue && isMatch(speechId.newValue)) {
					try {
						hold.speeches.getOrError(speechId.newValue).$location = ref;
					} catch (e: unknown) {
						hold.registerProblem({
							problem: "Speech referenced by the command did not exist. A new, empty one was created",
							ref,
						});

						const speech = new HoldSpeech(hold, {
							id: speechId.newValue,
							character: Speaker.None,
							delay: 0,
							encMessage: stringToWCharBase64(""),
							mood: Mood.Normal,
						});
						hold.speeches.set(speechId.newValue, speech);
					}
				}
			}
		}
	}
}

export function scanHoldForIssues(hold: Hold) {
	hold.rooms.forEach(room => {
		for (const monster of room.monsters) {
			const { $characterTypeId } = monster;
			if (
				$characterTypeId !== UINT_MINUS_1
				&& $characterTypeId >= CUSTOM_CHARACTER_FIRST
				&& !hold.characters.has($characterTypeId)
			) {
				hold.registerProblem({
					problem: `References character ID ${$characterTypeId} that does not exist.`,
					ref: {
						hold,
						model: HoldRefModel.MonsterCharacterType,
						roomId: room.id,
						monsterIndex: monster.$index
					}
				});
			}
		}
	});
}