import parse from 'csv-parse/lib/sync';
import {isValid, parseISO} from "date-fns";
import {Hold} from "../../data/Hold";
import {Store} from "../../data/Store";
import {StringUtils} from "../StringUtils";
import {UpdateUtils} from "../UpdateUtils";
import {CsvRow} from "./CsvExporter";

export interface CsvImportResult {
	importedRows: number;
	skippedRows: number;
	errors: string[];
}

function getErrorResult(error: string): CsvImportResult {
    return {
        importedRows: -1,
		skippedRows: -1,
        errors: [error]
    };
}

export const CsvImporter = {
	readFile(file: File, hold: Hold): Promise<CsvImportResult> {
		Store.isBusy.value = true;

		let res: (val: CsvImportResult) => void;
		const fileReader = new FileReader();
		fileReader.onload = async () => {
			const buffer = fileReader.result as ArrayBuffer;
			const data = new Uint8Array(buffer);

			try {
				const result = await CsvImporter.readString(StringUtils.uint8ToString(data), hold);
				res(result);
			} catch (e) {

				console.error(e);
				// Ignore
			}
			Store.isBusy.value = false;
		};
		fileReader.readAsArrayBuffer(file);

		return new Promise(resolve => {
			res = resolve;
		});
	},

	async readString(str: string, hold: Hold): Promise<CsvImportResult> {
		const csv = parse(str);

		if (Array.isArray(csv)) {
			return CsvImporter.readCsv(csv, hold);
		}

        return getErrorResult("Imported file was not recognized as a valid CSV");
	},

	readCsv(csv: any[], hold: Hold): CsvImportResult {
		if (csv.length === 0) {
			return getErrorResult("No data found in the loaded file");
		}

		const firstRow = csv[0];

		if (firstRow.length < 3) {
			return getErrorResult("Incorrect number of columns");
		} else if (firstRow[0] !== 'type') {
			return getErrorResult("First column must be 'type'");
		} else if (typeof firstRow.id === undefined) {
			return getErrorResult("Second column must be 'id'");
		} else if (typeof firstRow.value === undefined) {
			return getErrorResult("Third column must be 'value'");
		}

		const rows: CsvRow[] = [];
		for (let i = 1; i < csv.length; i++) {
			const [type, id, value] = csv[i]
			rows.push({type, id, value});
		}

		return CsvImporter.readCsvRows(rows, hold);
	},

	readCsvRows(rows: CsvRow[], hold: Hold): CsvImportResult {
		let importedRows = 0;
		let skippedRows = 0;
		let errors: string[] = [];
		for (const row of rows) {
			try {
				let wasChanged = false;
				switch (row.type) {
					case "HoldName":
						wasChanged = UpdateUtils.holdName(hold, row.value);
						break;
					case "HoldDescription":
						wasChanged = UpdateUtils.holdDescription(hold, row.value);
						break;
					case "HoldEnding":
						wasChanged = UpdateUtils.holdEnding(hold, row.value);
						break;
					case "PlayerName":
						wasChanged = UpdateUtils.playerName(parseInt(row.id), row.value, hold);
						break;

					case "CharacterName":
						wasChanged = UpdateUtils.characterName(parseInt(row.id), row.value, hold);
						break;
					case "ScrollText":
						wasChanged = UpdateUtils.scrollText(row.id, row.value, hold);
						break;

					case "EntranceText":
						wasChanged = UpdateUtils.entranceDescription(parseInt(row.id), row.value, hold);
						break;
					case "CommandText":
						wasChanged = UpdateUtils.speechText(parseInt(row.id), row.value, hold);
						break;
					case "LevelName":
						wasChanged = UpdateUtils.levelName(parseInt(row.id), row.value, hold);
						break;
					case "LevelCreatedDate":
						const date = parseISO(row.value);
						if (!isValid(date)) {
							throw new Error(`Invalid date format '${row.value}'`);
						}

						wasChanged = UpdateUtils.levelDateCreated(parseInt(row.id), date, hold);
						break;
				}
				importedRows += wasChanged ? 1 : 0;
				skippedRows += wasChanged ? 0 : 1;
			} catch (error) {
				errors.push(error.message ?? "Unknown error");
			}
		}

        return {
            importedRows,
			skippedRows,
            errors
        };
	},
};