export function range(from: number, to: number, step: number = 1) {
	const len = Math.floor((to - from) / step) + 1;
	return Array(len)
		.fill(0)
		.map((_, idx) => from + idx * step);
}

/**
 * Return elements from left array that are not present in the right array
 * AND elements from the right array not present in the left array.
 */
export function diffArrays<T extends string | number>(
	left: T[],
	right: T[],
): T[] {
	const leftSet = new Set(left);
	const rightSet = new Set(right);
	const diff = new Set<T>();

	for (const item of left) {
		if (!rightSet.has(item)) {
			diff.add(item);
		}
	}

	for (const item of right) {
		if (!leftSet.has(item)) {
			diff.add(item);
		}
	}

	return Array.from(diff);
}

/**
 * Return elements from left array that are not present in the right array
 * but NOT the other way around.
 */
export function diffArraysOneWay<T extends string | number>(
	left: T[],
	right: T[],
): T[] {
	const rightSet = new Set(right);
	const diff = new Set<T>();

	for (const item of left) {
		if (!rightSet.has(item)) {
			diff.add(item);
		}
	}

	return Array.from(diff);
}

export function copyWithout<T>(arr: T[], ...elements: T[]): T[] {
	return arr.filter(item => elements.includes(item));
}

export function removeArrayElementInline<T>(arr: T[], ...elements: T[]) {
	for (const element of elements) {
		const index = arr.indexOf(element);

		if (index !== -1) {
			arr.splice(index, 1);
		}
	}
}

export function filterInline<T>(arr: T[], predicate: (item: T) => boolean) {
	let index = arr.findIndex(predicate);

	while (index !== -1) {
		arr.splice(index, 1);
		index = arr.findIndex(predicate);
	}
}

export function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
	const totalLength = arrays.reduce((sum, c) => sum + c.length, 0);
	const concatenated = new Uint8Array(totalLength);

	let offset = 0;
	for (const array of arrays) {
		concatenated.set(array, offset);
		offset += array.length;
	}

	return concatenated;
}
