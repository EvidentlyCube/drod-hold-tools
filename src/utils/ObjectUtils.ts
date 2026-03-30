export function areObjectsSame<T extends object>(left: T, right: T): boolean {
	const leftKeys = Object.keys(left) as (keyof T)[];
	const rightKeys = Object.keys(right);

	return (
		leftKeys.length === rightKeys.length
		&& leftKeys.every(key => left[key] === right[key])
	);
}
