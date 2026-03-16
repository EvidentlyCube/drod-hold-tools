
const TEXT_DECODER = new TextDecoder();

export function guessMimeType(file: Uint8Array): string {
	if (isZip(file)) return 'application/zip';
	if (isPng(file)) return 'image/png';
	if (isJpeg(file)) return 'image/jpeg';
	if (isBmp(file)) return 'image/bmp';
	if (isWav(file)) return 'audio/wav';
	if (isOgg(file)) return 'audio/ogg';
	if (isTtf(file)) return 'application/octet-stream';
	if (isS3m(file)) return 'application/octet-stream';

	return 'application/octet-stream';
}

function isPng(data: Uint8Array) {
	return (
		data.byteLength >= 8 &&
		data[0] === 0x89 &&
		data[1] === 0x50 &&
		data[2] === 0x4E &&
		data[3] === 0x47 &&
		data[4] === 0x0D &&
		data[5] === 0x0A &&
		data[6] === 0x1A &&
		data[7] === 0x0A
	);
}

function isJpeg(data: Uint8Array) {
	return (
		data.byteLength >= 3 &&
		data[0] === 0xFF &&
		data[1] === 0xD8 &&
		data[2] === 0xFF
	);
}

function isBmp(data: Uint8Array) {
	return (
		data.byteLength >= 2 &&
		data[0] === 0x42 &&
		data[1] === 0x4D
	);
}

function isWav(data: Uint8Array) {
	return (
		data.byteLength >= 12 &&
		TEXT_DECODER.decode(data.subarray(0, 4)) === 'RIFF' &&
		TEXT_DECODER.decode(data.subarray(8, 12)) === 'WAVE'
	);
}

function isOgg(data: Uint8Array) {
	return (
		data.byteLength >= 4 &&
		TEXT_DECODER.decode(data.subarray(0, 4)) === 'OggS'
	);
}

function isTtf(data: Uint8Array) {
	if (data.byteLength < 4) {
		return false;
	}

	// TrueType font
	if (data[0] === 0x00 && data[1] === 0x01 && data[2] === 0x00 && data[3] === 0x00) {
		return true;
	}

	// OpenType
	if (TEXT_DECODER.decode(data.subarray(0, 4)) === 'OTTO') {
		return true;
	}

	return false;
}

function isS3m(data: Uint8Array) {
	if (data.byteLength < 0x30) {
		return false;
	}

	const marker = TEXT_DECODER.decode(data.subarray(0x2C, 0x30));
	return marker === 'SCRM';
}

function isZip(data: Uint8Array) {
	return (
		data.byteLength >= 2 &&
		data[0] === 0x50 &&
		data[1] === 0x4B
	);
}
