export function truncate(str: string | number, maxLength: number): string {
	str = str.toString();

	if (str.length <= maxLength) {
		return str;

	} else {
		return str.substring(0, maxLength * 0.9) + "...";
	}
}

export function bytesArrToBase64(bytes: number[]) {
	return btoa(bytes.map(i => String.fromCharCode(i)).join(''));
}

export function base64ToUint8(base64: string) {
	const binString = atob(base64);
	return Uint8Array.from(binString, m => m.codePointAt(0) ?? 0);
}

export function uint8ToBase64(bytes: Uint8Array) {
	const binString = Array.from(bytes, byte => String.fromCodePoint(byte)).join("");

	return btoa(binString);
}

export function formatString(base: string, ...args: (string | number)[]) {
	let counter = 0;
	return base.replace(/%/g, () => {
		return args[counter++].toString();
	})
}

export function escapeRegex(str: string) {
	return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function escapeRegexToGlob(str: string) {
	return str.replace(/[/\-\\^$+.()|[\]{}]/g, '\\$&')
		.replace(/\?/g, '.')
		.replace(/\*/g, '.*?');
}

export function escapeFilterToRegex(str: string) {
	switch (str.charAt(0)) {
		case '~':
			return str.substring(1);
		case '$':
			return '^' + escapeRegexToGlob(str.substring(1)) + '$';
		case '\\':
			return escapeRegexToGlob(str.substring(1));
		default:
			return escapeRegexToGlob(str);
	}
}

/**
 * Only use it for displaying things!
 */
export function fixCarriageReturnForDisplay(s: string): string {
	return s.replace(/\r/g, '\n');
}

export function fixCarriageReturnForStorage(s: string): string {
	return s.replace(/\n/g, '\r');
}

export function pluralize(countOrArray: number | unknown[], word: string, pluralWord?: string) {
	const count = Array.isArray(countOrArray) ? countOrArray.length : countOrArray;

	if (count === 1) {
		return word;
	} else {
		return pluralWord ?? `${word}s`;
	}
}