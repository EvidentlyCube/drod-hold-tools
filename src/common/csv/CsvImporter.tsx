import { isValid, parseISO } from "date-fns";
import neatCsv from "neat-csv";
import { Hold } from "../../data/Hold";
import { Store } from "../../data/Store";
import { ChangeUtils } from "../ChangeUtils";
import { StringUtils } from "../StringUtils";
import { UpdateUtils } from "../UpdateUtils";
import { CsvRow } from "./CsvExporter";


export const CsvImporter = {
    readFile(file: File, hold: Hold) {
        Store.isBusy.value = true;

        const fileReader = new FileReader();
        fileReader.onload = async () => {
            const buffer = fileReader.result as ArrayBuffer;
            const data = new Uint8Array(buffer);
            try {
                await CsvImporter.readString(StringUtils.uint8ToString(data), hold);
            } catch (e) {
                console.error(e);
                // Ignore
            }
            Store.isBusy.value = false;
        } 
    },
    async readString(str: string, hold: Hold) {
        const csv = await neatCsv(str);

        CsvImporter.readCsv(csv, hold);
    },

    readCsv(csv: neatCsv.Row[], hold: Hold) {
        if (csv.length === 0) {
            Store.addSystemMessage({color: 'error', message: "No data found in the loaded file"});
            return;
        }

        const firstRow = csv[0];
        if (typeof firstRow.type === undefined) {
            Store.addSystemMessage({color: 'error', message: "'type' column missing"});
            return;
        } else if (typeof firstRow.id === undefined) {
            Store.addSystemMessage({color: 'error', message: "'id' column missing"});
            return;
        } else if (typeof firstRow.value === undefined) {
            Store.addSystemMessage({color: 'error', message: "'value' column missing"});
            return;
        }

        CsvImporter.readCsvRows((csv as unknown) as CsvRow[], hold);
    },

    readCsvRows(rows: CsvRow[], hold: Hold) {
        let changed = 0;
        let errors: string[] = [];
        for (const row of rows) {
            try {
                switch(row.type) {
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
                        };
                        
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
                    message: `No data was updated and got ${errors.length} error${errors.length !== 1 ? 's' : ''}.`
                });
            } else {
                Store.addSystemMessage({
                    color: 'info',
                    message: `No data was updated.`
                });
            }
        } else {
            Store.addSystemMessage({
                color: 'success', 
                message: <>
                    <p>Updated {changed} row{changed !== 1 ? 's' : ''}.</p>
                    <p>got {errors.length} error{errors.length !== 1 ? 's' : ''}.</p>
                </> 
            });
        }

         
    }
}