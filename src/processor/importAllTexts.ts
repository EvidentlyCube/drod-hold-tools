import { Hold } from "../data/datatypes/Hold";
import { HoldCharacter } from "../data/datatypes/HoldCharacter";
import { HoldData } from "../data/datatypes/HoldData";
import { HoldEntrance } from "../data/datatypes/HoldEntrance";
import { HoldLevel } from "../data/datatypes/HoldLevel";
import { HoldPlayer } from "../data/datatypes/HoldPlayer";
import { HoldScroll } from "../data/datatypes/HoldRoom";
import { HoldSpeech } from "../data/datatypes/HoldSpeech";
import { ImportExportTextRowType } from "../data/DrodCommonTypes";
import { deserializeRef, resolveReference } from "../data/references/HoldReference";
import { TextUtils } from "../data/TextUtils";
import { shouldYieldToUi, yieldToUi } from "../utils/AsyncUtils";
import { csvStringToArray } from "../utils/CsvUtils";
import { shouldBeUnreachable } from "../utils/Interfaces";

interface ImportAllTextsResultSuccess {
	isSuccess: true;
	updatedRows: number;
	identicalRows: number;
	unresolvableRefs: number;
}

interface ImportAllTextsResultFailure {
	isSuccess: false;
	causedBy: Error;
}

export type ImportAllTextsResult = ImportAllTextsResultSuccess | ImportAllTextsResultFailure;

type Callback = () => void;

export async function importAllTexts(
	csvString: string,
	hold: Hold,
	onProgress: (progressFactor: number) => void
): Promise<ImportAllTextsResult> {
	const rows = csvStringToArray(csvString);

	const pendingOperations: Callback[] = [];
	const total = rows.length * 2;

	let index = 0;
	let updatedRows = 0;
	let identicalRows = 0;
	let unresolvableRefs = 0;

	try {
		for (const row of rows) {
			index++;

			if (row.length !== 6) {
				continue;
			}

			const rowType = row[2] as ImportExportTextRowType;
			switch (rowType) {
				case ImportExportTextRowType.Speech:
					pendingOperations.push(() => {
						const ref = deserializeRef(row[0], hold);

						if (!ref) {
							unresolvableRefs++;
							return;
						}

						const speech = resolveReference(ref);
						if (speech instanceof HoldSpeech) {
							const newMood = TextUtils.moodFromName(row[4]);
							const newMessage = row[5].trim();

							if (
								newMessage !== speech.message.newValue
								|| newMood !== speech.mood.newValue
							) {
								updatedRows++;
								speech.message.newValue = newMessage;
								// speech.mood.newValue = newMood;
							} else {
								identicalRows++;
							}
						} else {
							unresolvableRefs++;
						}
					});
					break;

				case ImportExportTextRowType.CharacterName:
					pendingOperations.push(() => {
						const ref = deserializeRef(row[0], hold);

						if (!ref) {
							unresolvableRefs++;
							return;
						}

						const character = resolveReference(ref);
						if (character instanceof HoldCharacter) {
							const newName = row[5].trim();

							if (newName !== character.name.newValue) {
								updatedRows++;
								character.name.newValue = newName;
							} else {
								identicalRows++;
							}
						} else {
							unresolvableRefs++;
						}
					});
					break;

				case ImportExportTextRowType.DataName:
					pendingOperations.push(() => {
						const ref = deserializeRef(row[0], hold);

						if (!ref) {
							unresolvableRefs++;
							return;
						}

						const data = resolveReference(ref);
						if (data instanceof HoldData) {
							const newName = row[5].trim();

							if (newName !== data.name.newValue) {
								updatedRows++;
								data.name.newValue = newName;
							} else {
								identicalRows++;
							}
						} else {
							unresolvableRefs++;
						}
					});
					break;

				case ImportExportTextRowType.LevelName:
					pendingOperations.push(() => {
						const ref = deserializeRef(row[0], hold);

						if (!ref) {
							unresolvableRefs++;
							return;
						}

						const level = resolveReference(ref);
						if (level instanceof HoldLevel) {
							const newName = row[5].trim();

							if (newName !== level.name.newValue) {
								updatedRows++;
								level.name.newValue = newName;
							} else {
								identicalRows++;
							}
						} else {
							unresolvableRefs++;
						}
					});
					break;

				case ImportExportTextRowType.PlayerName:
					pendingOperations.push(() => {
						const ref = deserializeRef(row[0], hold);

						if (!ref) {
							unresolvableRefs++;
							return;
						}

						const player = resolveReference(ref);
						if (player instanceof HoldPlayer) {
							const newName = row[5].trim();

							if (newName !== player.name.newValue) {
								updatedRows++;
								player.name.newValue = newName;
							} else {
								identicalRows++;
							}
						} else {
							unresolvableRefs++;
						}
					});
					break;

				case ImportExportTextRowType.ScrollText:
					pendingOperations.push(() => {
						const ref = deserializeRef(row[0], hold);

						if (!ref) {
							unresolvableRefs++;
							return;
						}

						const scroll = resolveReference(ref);
						if (scroll instanceof HoldScroll) {
							const newMessage = row[5].trim();

							if (newMessage !== scroll.message.newValue) {
								updatedRows++;
								scroll.message.newValue = newMessage;
							} else {
								identicalRows++;
							}
						} else {
							unresolvableRefs++;
						}
					});
					break;

				case ImportExportTextRowType.EntranceText:
					pendingOperations.push(() => {
						const ref = deserializeRef(row[0], hold);

						if (!ref) {
							unresolvableRefs++;
							return;
						}

						const entrance = resolveReference(ref);
						if (entrance instanceof HoldEntrance) {
							const newName = row[5].trim();

							if (newName !== entrance.description.newValue) {
								updatedRows++;
								entrance.description.newValue = newName;
							} else {
								identicalRows++;
							}
						} else {
							unresolvableRefs++;
						}
					});
					break;

				default:
					shouldBeUnreachable(rowType);
					break;
			}

			if (shouldYieldToUi()) {
				onProgress(index / total);
				await yieldToUi();
			}
		}

		for (const callback of pendingOperations) {
			callback();
			index++;

			if (shouldYieldToUi()) {
				onProgress(index / total);
				await yieldToUi();
			}
		}

		return {
			isSuccess: true,
			identicalRows, unresolvableRefs, updatedRows
		};

	} catch (e) {
		return {
			isSuccess: false,
			causedBy: e instanceof Error ? e : new Error(String(e)),
		}
	}

}