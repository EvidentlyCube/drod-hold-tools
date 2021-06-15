import { isValid, parseISO } from "date-fns";
import neatCsv from "neat-csv";
import { Hold } from "../../data/Hold";
import { Store } from "../../data/Store";
import { ChangeUtils } from "../ChangeUtils";
import { StringUtils } from "../StringUtils";
import { CsvRow } from "./CsvExporter";


export const CsvImporter = {
    readFile(file: File, hold: Hold) {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const buffer = fileReader.result as ArrayBuffer;
            const data = new Uint8Array(buffer);
            CsvImporter.readString(StringUtils.uint8ToString(data), hold);
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
        for (const row of rows) {
            switch(row.type) {
                case "HoldName":
                    hold.changes.name = row.value;
                    ChangeUtils.holdName(hold);
                    break;
                case "HoldDescription":
                    hold.changes.description = row.value;
                    ChangeUtils.holdDescription(hold);
                    break;
                case "HoldEnding":
                    hold.changes.ending = row.value;
                    ChangeUtils.holdEnding(hold);
                    break;
                case "PlayerName":
                    const player = hold.players.get(parseInt(row.id));
                    if (!player) continue;

                    player.changes.name = row.value;
                    ChangeUtils.playerName(player, hold);
                    break;

                case "CharacterName":
                    const character = hold.characters.get(parseInt(row.id));
                    if (!character) continue;

                    character.changes.name = row.value;
                    ChangeUtils.characterName(character, hold);
                    break;
                case "ScrollText":
                    const scroll = hold.scrolls.get(row.id);
                    if (!scroll) continue;

                    scroll.changes.text = row.value;
                    ChangeUtils.scrollText(scroll, hold);
                    break;

                case "EntranceText":
                    const entrance = hold.entrances.get(parseInt(row.id));
                    if (!entrance) continue;

                    entrance.changes.description = row.value;
                    ChangeUtils.entranceDescription(entrance, hold);
                    break;
                case "CommandText":
                    const speech = hold.speeches.get(parseInt(row.id));
                    if (!speech) continue;

                    speech.changes.text = row.value;
                    ChangeUtils.speechText(speech, hold);
                    break;
                case "LevelName": {
                    const level = hold.levels.get(parseInt(row.id));
                    if (!level) continue;

                    level.changes.name = row.value;
                    ChangeUtils.levelName(level, hold);
                }
                    break;
                case "LevelCreatedDate": {
                    const level = hold.levels.get(parseInt(row.id));
                    if (!level) continue;

                    const date = parseISO(row.value);
                    if (!isValid(date)) continue;
                    
                    level.changes.dateCreated = date;
                    ChangeUtils.levelDateCreated(level, hold);
                }
                    break;
            }
        }
    }
}