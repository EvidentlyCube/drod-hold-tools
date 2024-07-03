import { HoldRef } from "../data/references/HoldReference";
import { holdRefToSortableString } from "../data/references/holdRefToSortableString";

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

	if (left.model !== right.model) {
		return sortCompareString(isAsc, left.model, right.model);
	}

	return sortCompareString(isAsc, holdRefToSortableString(left), holdRefToSortableString(right));
}