import { doesCommandUseSpeech } from "../data/CommandUtils";
import { ImportExportTextRowType } from "../data/DrodCommonTypes";
import type { Hold } from "../data/datatypes/Hold";
import { HoldRefModel, serializeRef } from "../data/references/HoldReference";
import { TextUtils } from "../data/TextUtils";
import { getShowDescriptionName } from "../data/Utils";
import { tryToYieldToUi } from "../utils/AsyncUtils";
import { arrayToCsvString } from "../utils/CsvUtils";

export async function exportAllTexts(
	hold: Hold,
	onProgress: (progressFactor: number) => void,
): Promise<string> {
	const recordsCount =
		hold.speeches.size
		+ hold.levels.size
		+ hold.rooms.size
		+ hold.characters.size
		+ hold.players.size
		+ hold.datas.size
		+ hold.$scrolls.length;

	const rows: string[][] = [];
	const parsedSpeechIds = new Set<number>();
	let index = 0;

	rows.push(["Hold Ref", "Location", "Type", "Info 1", "Info 2", "Text"]);

	const exportSpeech = (speechId: number, location: string) => {
		if (parsedSpeechIds.has(speechId)) {
			return;
		}

		parsedSpeechIds.add(speechId);

		const speech = hold.speeches.get(speechId);
		if (!speech) {
			return;
		}

		rows.push([
			serializeRef(speech.$ref),
			location,
			ImportExportTextRowType.Speech,
			speech.$speaker,
			speech.$mood,
			speech.message.newValue,
		]);
		index++;
	};

	for (const player of hold.players.values()) {
		const playerId = player.id;
		rows.push([
			serializeRef({ model: HoldRefModel.Player, hold, playerId }),
			"Hold",
			ImportExportTextRowType.PlayerName,
			"",
			"",
			player.name.newValue,
		]);

		index++;
	}

	onProgress(index / recordsCount);
	await tryToYieldToUi();

	for (const level of hold.levels.values()) {
		const levelId = level.id;
		rows.push([
			serializeRef({ model: HoldRefModel.Level, hold, levelId }),
			"Hold",
			ImportExportTextRowType.LevelName,
			"",
			"",
			level.name.newValue,
		]);

		index++;
	}

	onProgress(index / recordsCount);
	await tryToYieldToUi();

	for (const entrance of hold.entrances.values()) {
		const entranceId = entrance.id;
		rows.push([
			serializeRef({ model: HoldRefModel.Entrance, hold, entranceId }),
			"Hold",
			ImportExportTextRowType.EntranceText,
			"",
			getShowDescriptionName(entrance.showDescription.newValue),
			entrance.description.newValue,
		]);

		index++;
	}

	onProgress(index / recordsCount);
	await tryToYieldToUi();

	for (const character of hold.characters.values()) {
		const characterId = character.id;
		rows.push([
			serializeRef({ model: HoldRefModel.Character, hold, characterId }),
			"Hold",
			ImportExportTextRowType.CharacterName,
			"",
			"",
			character.name.newValue,
		]);

		if (character.$commandList) {
			for (const command of character.$commandList.$commandsWithSpeech) {
				if (!doesCommandUseSpeech(command.type)) {
					continue;
				}

				exportSpeech(
					command.speechId.newValue,
					`Character ${character.name.newValue}, Command #${command.index}`,
				);
			}
		}

		index++;
	}

	onProgress(index / recordsCount);
	await tryToYieldToUi();

	for (const scroll of hold.$scrolls) {
		const { x, y, $room } = scroll;
		rows.push([
			serializeRef({
				model: HoldRefModel.Scroll,
				hold,
				roomId: $room.id,
				x,
				y,
			}),
			`${$room.$level.name.newValue}: ${$room.$coordsName} (${x},${y})`,
			ImportExportTextRowType.ScrollText,
			"",
			"",
			scroll.message.newValue,
		]);

		index++;
	}

	onProgress(index / recordsCount);
	await tryToYieldToUi();

	for (const room of hold.rooms.values()) {
		for (const monster of room.$monstersWithSpeechCommand) {
			if (monster.$commandList) {
				const { x, y } = monster;
				for (const command of monster.$commandList.$commandsWithSpeech) {
					if (!doesCommandUseSpeech(command.type)) {
						continue;
					}

					exportSpeech(
						command.speechId.newValue,
						`${room.$level.name.newValue}: ${room.$coordsName}, ${TextUtils.entity(monster.type, hold)} at (${x},${y}), Command #${command.index}`,
					);
				}
			}
		}

		index++;
	}

	onProgress(index / recordsCount);
	await tryToYieldToUi();

	for (const speech of hold.speeches.values()) {
		if (parsedSpeechIds.has(speech.id)) {
			continue;
		}

		parsedSpeechIds.add(speech.id);

		rows.push([
			serializeRef(speech.$ref),
			"<unused>",
			ImportExportTextRowType.Speech,
			speech.$speaker,
			speech.$mood,
			speech.message.newValue,
		]);

		index++;
	}

	onProgress(index / recordsCount);
	await tryToYieldToUi();

	return arrayToCsvString(rows);
}
