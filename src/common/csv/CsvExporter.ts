import { Hold } from "../../data/Hold";
import { DateUtils } from "../DateUtils";

export type CsvRowType = 'HoldName' | 'HoldDescription' | 'HoldEnding'
    | 'LevelName' | 'LevelCreatedDate'
    | 'PlayerName'
    | 'CommandText'
    | 'EntranceText'
    | 'CharacterName'
    | 'ScrollText';

export interface CsvRow {
    type: CsvRowType;
    id: string;
    value: string;
}

function encodeCell(cell: string) {
    const wrap = cell.indexOf(',') !== -1 
        || cell.indexOf("\n") !== -1
        || cell.indexOf("\r") !== -1
        || cell.indexOf('"') !== -1;

    return wrap
        ? `"${cell.replace(/"/g, '""')}"`
        : cell;
}

function encodeRow(row: CsvRow) {
    return `${encodeCell(row.type)},${encodeCell(row.id)},${encodeCell(row.value)}`;
}

export const CsvExporter = {
    hold(hold: Hold) {
        const csv: CsvRow[] = [];
        csv.push({type: 'HoldName', id: '', value: hold.name});
        csv.push({type: 'HoldDescription', id: '', value: hold.description});
        csv.push({type: 'HoldEnding', id: '', value: hold.ending});
        
        for (const level of hold.levels.values()) {
            csv.push({type: 'LevelName', id: level.id.toString(), value: level.name});
            csv.push({type: 'LevelCreatedDate', id: level.id.toString(), value: DateUtils.formatDate(level.dateCreated)});
        }

        for (const entrance of hold.entrances.values()) {
            csv.push({type: 'EntranceText', id: entrance.id.toString(), value: entrance.description});
        }

        for (const character of hold.characters.values()) {
            csv.push({type: 'CharacterName', id: character.id.toString(), value: character.name});
        }

        for (const scroll of hold.scrolls.values()) {
            csv.push({type: 'ScrollText', id: scroll.id, value: scroll.text});
        }

        for (const player of hold.players.values()) {
            csv.push({type: 'PlayerName', id: player.id.toString(), value: player.name});
        }
        
        for (const speech of hold.speeches.values()) {
            csv.push({type: 'CommandText', id: speech.id.toString(), value: speech.text});
        }

        return "type,id,value\r\n" 
            + csv.map(row => encodeRow(row)).join("\r\n");
    },
}