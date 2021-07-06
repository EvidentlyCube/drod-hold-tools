import {Hold} from "../../data/Hold";
import {StringUtils} from "../StringUtils";
import {Level} from "../../data/Level";
import {Speech} from "../../data/Speech";
import {Entrance} from "../../data/Entrance";
import {Scroll} from "../../data/Scroll";
import {Character} from "../../data/Character";
import {ModelType} from "../Enums";
import {UpdateUtils} from "../UpdateUtils";

const IsRegexRegex = /^\/(.+?)\/((?!.*(.).*\1)[imsu]*)$/;
const OpenTag = "\x02";
const CloseTag = "\x03";
const OpenTagRegexp = new RegExp(OpenTag, 'g');
const CloseTagRegexp = new RegExp(CloseTag, 'g');

interface RowHold {
	data: Hold,
	field: keyof Hold
}

interface RowLevel {
	data: Level,
	field: keyof Level
}

interface RowSpeech {
	data: Speech,
	field: keyof Speech
}

interface RowEntrance {
	data: Entrance,
	field: keyof Entrance
}

interface RowScroll {
	data: Scroll,
	field: keyof Scroll
}

interface RowCharacter {
	data: Character,
	field: keyof Character
}

export type SearchReplaceResultRow = (RowHold | RowLevel | RowSpeech | RowEntrance | RowScroll | RowCharacter) & {
	id: number;
	oldValue: string;
	newValue: string;
	oldHtml: string;
	newHtml: string;
	include: boolean;
}

export const SearchReplaceUtils = {
	isRegex(str: string) {
		return IsRegexRegex.test(str);
	},
	toRegex(str: string) {
		if (SearchReplaceUtils.isRegex(str)) {
			const matches = str.match(IsRegexRegex);

			if (matches) {
				return new RegExp(matches[1], matches[2] + 'g');
			}
		}
		return new RegExp(StringUtils.escapeRegExp(str), 'g');
	},

	prepare(from: RegExp, to: string, hold: Hold) {
		let id = 0;
		const records: SearchReplaceResultRow[] = [];
		const addRecord = (data: any, field: any) => {
			const oldValue = (data.changes[field] ?? data[field]) as string;
			const newValue = oldValue.replace(from, to);

			if (oldValue !== newValue) {
				const oldHtml = StringUtils.htmlEntities(oldValue.replace(from, `${OpenTag}$&${CloseTag}`))
					.replace(OpenTagRegexp, '<em>')
					.replace(CloseTagRegexp, '</em>');
				const newHtml = StringUtils.htmlEntities(oldValue.replace(from, `${OpenTag}${to}${CloseTag}`))
					.replace(OpenTagRegexp, '<em>')
					.replace(CloseTagRegexp, '</em>');

				records.push({
					id: ++id,
					include: false,
					data, field, oldValue, newValue, oldHtml, newHtml,
				});
			}
		};
		addRecord(hold, 'name');
		addRecord(hold, 'description');
		addRecord(hold, 'ending');

		for (const speech of hold.speeches.values()) {
			addRecord(speech, 'text');
		}
		for (const character of hold.characters.values()) {
			addRecord(character, 'name');
		}
		for (const scroll of hold.scrolls.values()) {
			addRecord(scroll, 'text');
		}
		for (const level of hold.levels.values()) {
			addRecord(level, 'name');
		}
		for (const entrance of hold.entrances.values()) {
			addRecord(entrance, 'description');
		}

		return records;
	},
	commit(results: SearchReplaceResultRow[], hold: Hold) {
		for (const row of results) {
			if (!row.include) {
				continue;
			}
			switch (row.data.modelType) {
				case ModelType.Hold:
					if (row.field === 'name') {
						UpdateUtils.holdName(row.data, row.newValue);
					} else if (row.field === 'description') {
						UpdateUtils.holdDescription(row.data, row.newValue);
					} else if (row.field === 'ending') {
						UpdateUtils.holdEnding(row.data, row.newValue);
					}
					break;
				case ModelType.Level:
					if (row.field === 'name') {
						UpdateUtils.levelName(row.data, row.newValue, hold);
					}
					break;
				case ModelType.Speech:
					if (row.field === 'text') {
						UpdateUtils.speechText(row.data, row.newValue, hold);
					}
					break;
				case ModelType.Scroll:
					if (row.field === 'text') {
						UpdateUtils.scrollText(row.data, row.newValue, hold);
					}
					break;
				case ModelType.Entrance:
					if (row.field === 'description') {
						UpdateUtils.entranceDescription(row.data, row.newValue, hold);
					}
					break;
				case ModelType.Character:
					if (row.field === 'name') {
						UpdateUtils.characterName(row.data, row.newValue, hold);
					}
					break;
			}
		}
	},
};