export function sortCompareString(isAsc: boolean, left: string, right: string) {
	return isAsc
		? left.localeCompare(right)
		: right.localeCompare(left);
}
export function sortCompareNumber(isAsc: boolean, left: number, right: number) {
	return isAsc
		? left - right
		: right - left
}