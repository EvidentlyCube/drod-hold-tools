import { getFormatName } from "../data/Utils";
import { HoldData } from "../data/datatypes/HoldData";
import { HoldRef } from "../data/references/HoldReference";
import { holdRefToSortableString } from "../data/references/holdRefToSortableString";
import { escapeFilterToRegex } from "./StringUtils";

export function sortCompareString(isAsc: boolean, left: string, right: string) {
	return isAsc
		? left.localeCompare(right)
		: right.localeCompare(left);
}

export function sortCompareStringOptional(isAsc: boolean, left: string | undefined, right: string | undefined) {
	if (!left || !right) {
		return sortCompareWithUndefined(isAsc, left, right);
	}

	return isAsc
		? left.localeCompare(right)
		: right.localeCompare(left);
}

export function sortCompareWithUndefined<T>(isAsc: boolean, left: T|undefined, right: T|undefined) {
	if (left && right) {
		return 0;

	} else if (!left && !right) {
		return 0;

	} else if (!left) {
		return isAsc ? 1 : -1;

	} else {
		return isAsc ? -1 : 1;
	}
}

export function sortCompareNumber(isAsc: boolean, left: number, right: number) {
	return isAsc
		? left - right
		: right - left
}

export function sortCompareRefs(isAsc: boolean, left?: HoldRef, right?: HoldRef) {
	if (!left || !right) {
		return sortCompareWithUndefined(isAsc, left, right);
	}

	return sortCompareString(isAsc, holdRefToSortableString(left), holdRefToSortableString(right));
}

export function sortData(isAsc: boolean, left?: HoldData, right?: HoldData) {
	if (!left || !right) {
		return sortCompareWithUndefined(isAsc, left, right);
	}

	return sortCompareString(isAsc, getFormatName(left.details.newValue.format), getFormatName(right.details.newValue.format))
		|| sortCompareString(isAsc, left.name.newValue, right.name.newValue);
}


let cacheClearTimeout: undefined | number;
const filterStringCache = new Map<string, RegExp>();

export function filterString(toFilter: string, filter: string): boolean {
	let regex = filterStringCache.get(filter);
	if (!regex) {
		regex = new RegExp(escapeFilterToRegex(filter), 'i');
		filterStringCache.set(filter, regex);

		if (!cacheClearTimeout) {
			cacheClearTimeout = window.setTimeout(() => {
				filterStringCache.clear();
				cacheClearTimeout = undefined;
			}, 60000);
		}
	}

	return regex.test(toFilter);
}