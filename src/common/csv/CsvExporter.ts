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

export const CsvExporter = {
    hold(hold: Hold, csv: any[] = []) {
        csv.push({type: 'HoldName', id: '', value: hold.name});
        csv.push({type: 'HoldDescription', id: '', value: hold.description});
        csv.push({type: 'HoldEnding', id: '', value: hold.ending});
        
        for (const level of hold.levels.values()) {
            csv.push({type: 'LevelName', id: level.id, value: level.name});
            csv.push({type: 'LevelCreatedDatelName', id: level.id, value: DateUtils.formatDate(level.dateCreated)});
        }

        for (const entrance of hold.entrances.values()) {
            csv.push({type: 'EntranceText', id: entrance.id, value: entrance.description});
        }

        for (const character of hold.characters.values()) {
            csv.push({type: 'CharacterName', id: character.id, value: character.name});
        }

        for (const scroll of hold.scrolls.values()) {
            csv.push({type: 'ScrollText', id: scroll.id, value: scroll.text});
        }

        for (const player of hold.players.values()) {
            csv.push({type: 'PlayerName', id: player.id, value: player.name});
        }
        
        for (const speech of hold.speeches.values()) {
            csv.push({type: 'CommandsUtils', id: speech.id, value: speech.text});
        }
    },
}