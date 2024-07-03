export function range(from: number, to: number, step: number = 1) {
	const len = Math.floor((to - from) / step) + 1
	return Array(len).fill(0).map((_, idx) => from + (idx * step))
}

export function diffArrays<T extends (string|number)>(left: T[], right: T[]): T[] {
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

export function copyWithout<T>(arr: T[], ...elements:T[]): T[] {
	return arr.filter(item => elements.includes(item));
}