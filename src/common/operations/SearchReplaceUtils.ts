import { Hold } from "../../data/Hold";
import { StringUtils } from "../StringUtils";

const IsRegexRegex = /^\/(.+?)\/((?!.*(.).*\1)[imsu]*)$/;

export interface SearchReplaceResultRow<T = any>{
	data: T;
	field: keyof T;
	oldValue: string;
	newValue: string;
}

export const SearchReplaceUtils = {
	isRegex(str: string) {
		return IsRegexRegex.test(str)
	},
	toRegex(str: string) {
		if (SearchReplaceUtils.isRegex(str)) {
			const matches = str.match(IsRegexRegex);

			if (matches) {
				return new RegExp(matches[0], matches[1]);
			}
		}
		return new RegExp(StringUtils.escapeRegExp(str));
	},

	prepare(from: RegExp, to: string, hold: Hold) {
		const records: SearchReplaceResultRow<any>[] = [];
		const addRecord = <T>(data: T, field: keyof T) => {
			const oldValue = (data[field] as unknown) as string;
			const newValue = oldValue.replace(from, to);

			if (oldValue !== newValue) {
				records.push({data, field, oldValue, newValue});
			}
		}
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
	}
}