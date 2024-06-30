import { bytesArrToBase64 as bytesToBase64 } from "../utils/StringUtils";

export function wcharBase64ToString(encodedText: string) {
	const decodedData = base64ToUint8(encodedText);

	const codePoints = [];
	for (let i = 0; i < decodedData.length; i += 2) {
		codePoints.push(decodedData[i] | (decodedData[i + 1] << 8));
	}

	return String.fromCharCode.apply(String, codePoints);
}

export function stringToWCharBase64(s: string) {
	const bytes = [];

	for (let i = 0; i < s.length; i++) {
		const charCode = s.charCodeAt(i);
		if (charCode > 128) {
			throw new Error(`Unsupported wchar with code ${charCode}`);
		}

		bytes.push(charCode);
		bytes.push(0);
	}

	return bytesToBase64(bytes);
}

export function base64ToUint8(data: string) {
	const bytes = atob(data).split('').map(c => c.codePointAt(0) ?? 0)

	return new Uint8Array(bytes);
}