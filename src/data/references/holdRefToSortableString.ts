import { HoldRef } from "./HoldReference";

let cacheClearTimeout: undefined | number;
const refsCache = new Map<HoldRef, string>();

export function holdRefToSortableString(ref: HoldRef): string {
	const cachedRef = refsCache.get(ref);
	if (cachedRef) {
		return cachedRef;
	}

	if (!cacheClearTimeout) {
		cacheClearTimeout = window.setTimeout(() => {
			refsCache.clear();
			cacheClearTimeout = undefined;
		}, 1000);
	}

	const sortableRef = toSortableString(ref);
	refsCache.set(ref, sortableRef);
	return sortableRef;
}

function toSortableString(ref: HoldRef) {
	switch (ref.model) {
		default:
			return 'Unknown model';
	}
}