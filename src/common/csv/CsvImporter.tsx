import parse from 'csv-parse/lib/sync';
import {isValid, parseISO} from "date-fns";
import {Hold} from "../../data/Hold";
import {Store} from "../../data/Store";
import {StringUtils} from "../StringUtils";
import {UpdateUtils} from "../UpdateUtils";
import {CsvRow} from "./CsvExporter";


export interface CsvImportResult {
	importedRows: number;
	errors: string[];
}

export const CsvImporter = {
	readFile(file: File, hold: Hold): Promise<CsvImportResult> {
		Store.isBusy.value = true;

		let res;
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

	async readString(str: string, hold: Hold) {
		const csv = parse(str);

		if (Array.isArray(csv)) {
			return CsvImporter.readCsv(csv, hold);
		}


	},

	readCsv(csv: any[], hold: Hold) {
		if (csv.length === 0) {
			Store.addSystemMessage({color: 'error', message: "No data found in the loaded file"});
			return;
		}

		const firstRow = csv[0];

		if (firstRow.length !== 3) {
			Store.addSystemMessage({color: 'error', message: "Incorrect number of columns"});
		} else if (firstRow[0] !== 'type') {
			Store.addSystemMessage({color: 'error', message: "First column must be 'type'"});
			return;
		} else if (typeof firstRow.id === undefined) {
			Store.addSystemMessage({color: 'error', message: "Second column must be 'id'"});
			return;
		} else if (typeof firstRow.value === undefined) {
			Store.addSystemMessage({color: 'error', message: "Third column must be 'value'"});
			return;
		}

		const rows: CsvRow[] = [];
		for (let i = 1; i < csv.length; i++) {
			const [type, id, value] = csv[i]
			rows.push({type, id, value});
		}
		console.log(rows);

		CsvImporter.readCsvRows(rows, hold);
	},

	readCsvRows(rows: CsvRow[], hold: Hold) {
		let changed = 0;
		let errors: string[] = [];
		for (const row of rows) {
			try {
				switch (row.type) {
					case "HoldName":
						changed += UpdateUtils.holdName(hold, row.value) ? 1 : 0;
						break;
					case "HoldDescription":
						changed += UpdateUtils.holdDescription(hold, row.value) ? 1 : 0;
						break;
					case "HoldEnding":
						changed += UpdateUtils.holdEnding(hold, row.value) ? 1 : 0;
						break;
					case "PlayerName":
						changed += UpdateUtils.playerName(parseInt(row.id), row.value, hold) ? 1 : 0;
						break;

					case "CharacterName":
						changed += UpdateUtils.characterName(parseInt(row.id), row.value, hold) ? 1 : 0;
						break;
					case "ScrollText":
						changed += UpdateUtils.scrollText(row.id, row.value, hold) ? 1 : 0;
						break;

					case "EntranceText":
						changed += UpdateUtils.entranceDescription(parseInt(row.id), row.value, hold) ? 1 : 0;
						break;
					case "CommandText":
						changed += UpdateUtils.speechText(parseInt(row.id), row.value, hold) ? 1 : 0;
						break;
					case "LevelName":
						changed += UpdateUtils.levelName(parseInt(row.id), row.value, hold) ? 1 : 0;
						break;
					case "LevelCreatedDate":
						const date = parseISO(row.value);
						if (!isValid(date)) {
							throw new Error(`Invalid date format '${row.value}'`);
						}

						changed += UpdateUtils.levelDateCreated(parseInt(row.id), date, hold) ? 1 : 0;
						break;
				}
			} catch (error) {
				errors.push(error.message ?? "Unknown error");
			}
		}

		if (changed === 0) {
			if (errors.length > 0) {
				Store.addSystemMessage({
					color: 'error',
					message: `No data was updated and got ${errors.length} error${errors.length !== 1 ? 's' : ''}.`,
				});
			} else {
				Store.addSystemMessage({
					color: 'info',
					message: `No data was updated.`,
				});
			}
		} else {
			Store.addSystemMessage({
				color: 'success',
				message: <>
					<p>Updated {changed} row{changed !== 1 ? 's' : ''}.</p>
					<p>got {errors.length} error{errors.length !== 1 ? 's' : ''}.</p>
				</>,
			});
		}


	},
};