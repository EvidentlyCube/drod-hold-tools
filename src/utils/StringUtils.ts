export function truncate(str: string| number, maxLength: number): string {
	str = str.toString();

	if (str.length <= maxLength) {
		return str;

	} else {
		return str.substring(0, maxLength * 0.9) + "...";
	}
}

export function bytesArrToBase64(bytes: number[]) {
	return btoa(String.fromCharCode.apply(null, bytes));
}