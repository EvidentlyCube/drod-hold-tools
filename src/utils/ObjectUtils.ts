
export function areObjectsSame(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
	return Object.keys(left).length === Object.keys(right).length
		&& Object.keys(left).every(key => left[key] === right[key]);
}