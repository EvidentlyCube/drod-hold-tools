import {Hold} from "../../data/Hold";
import {DateUtils} from "../DateUtils";
import {LocationUtils} from "../LocationUtils";
import {StringUtils} from "../StringUtils";
import {CharCommand, CommandNameMap} from "../Enums";
import {SpeechUtils} from "../SpeechUtils";
import {SortUtils} from "../SortUtils";
import {Monster} from "../../data/Monster";

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
	location?: string;
	speaker?: string;
	comment?: string;
}

function encodeCell(cell: string|undefined) {
	if (cell === undefined) {
		return '';
	}
	const wrap = cell.indexOf(',') !== -1
		|| cell.indexOf("\n") !== -1
		|| cell.indexOf("\r") !== -1
		|| cell.indexOf('"') !== -1;

	return wrap
		? `"${cell.replace(/"/g, '""')}"`
		: cell;
}

function encodeRow(row: CsvRow) {
	return `${encodeCell(row.type)},${encodeCell(row.id)},${encodeCell(row.value)},${encodeCell(row.location)},${encodeCell(row.speaker)},${encodeCell(row.comment)}`;
}

function getSortedSpeeches(hold: Hold) {
	const speeches = Array.from(hold.speeches.values());

	speeches.sort((a, b) => {
		const aLoc = a.location!;
		const bLoc = b.location!;

		if (!aLoc && !bLoc) {
			return a.id - b.id;
		} else if (!aLoc) {
			return -1;
		} else if (!bLoc) {
			return 1;
		} else if (!aLoc || !bLoc){
			return 0;
		}

		const aSrc = a.source as Monster|undefined;
		const bSrc = b.source as Monster|undefined;

		return [
			SortUtils.compareOptionalNumber(aLoc.levelId, bLoc.levelId),
			SortUtils.compareOptionalNumber(aLoc.roomId, bLoc.roomId),
			SortUtils.compareOptionalNumber(aSrc?.x, bSrc?.x),
			SortUtils.compareOptionalNumber(aSrc?.y, bSrc?.y),
			SortUtils.compareOptionalNumber(aLoc.speechCustomY, bLoc.speechCustomY),
			SortUtils.compareOptionalString(aLoc.characterName, bLoc.characterName),
			SortUtils.compareOptionalNumber(aLoc.index, bLoc.index)
		].find(x => x !== 0) || (a.id - b.id);
	});

	return speeches;
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
			const location = StringUtils.sprintf(
				'%s%s%s',
				entrance.showDescription ? "[NOT DISPLAYED] " : '',
				entrance.isMainEntrance ? "[MAIN] " : '',
				LocationUtils.getDisplay(entrance, hold),
			);
			const commentBits = [];
			if (entrance.isMainEntrance) {
				commentBits.push("Main Entrance");
			}
			if (!entrance.showDescription) {
				commentBits.push("Description Not Displayed")
			}

			csv.push({type: 'EntranceText', id: entrance.id.toString(), value: entrance.description, location, comment: commentBits.join(',')});
		}

		for (const character of hold.characters.values()) {
			csv.push({type: 'CharacterName', id: character.id.toString(), value: character.name});
		}

		for (const scroll of hold.scrolls.values()) {
			const location = LocationUtils.getDisplay(scroll, hold);
			csv.push({type: 'ScrollText', id: scroll.id, value: scroll.text, location});
		}

		for (const player of hold.players.values()) {
			csv.push({type: 'PlayerName', id: player.id.toString(), value: player.name});
		}

		for (const speech of getSortedSpeeches(hold)) {
			const location = SpeechUtils.getDisplayLocation(speech);
			const speaker = speech.command.command === CharCommand.CC_Speech
				? ', ' + SpeechUtils.getDisplaySpeaker(speech, hold)
				: '';
			const comment = `${CommandNameMap.get(speech.command.command)}:${speech.location?.index}`;

			csv.push({type: 'CommandText', id: speech.id.toString(), value: speech.text, location, speaker, comment});
		}

		console.log(csv);

		return "type,id,value,location,speaker,comment\r\n"
			+ csv.map(row => encodeRow(row)).join("\r\n");
	},
};