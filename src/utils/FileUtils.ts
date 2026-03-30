const TEXT_DECODER = new TextDecoder();

export function guessMimeType(file: Uint8Array): string {
	if (isZip(file)) return "application/zip";
	if (isPng(file)) return "image/png";
	if (isJpeg(file)) return "image/jpeg";
	if (isBmp(file)) return "image/bmp";
	if (isWav(file)) return "audio/wav";
	if (isOgg(file)) return "audio/ogg";
	if (isTtf(file)) return "application/octet-stream";
	if (isS3m(file)) return "application/octet-stream";

	return "application/octet-stream";
}

function isPng(data: Uint8Array) {
	return (
		data.byteLength >= 8
		&& data[0] === 0x89
		&& data[1] === 0x50
		&& data[2] === 0x4e
		&& data[3] === 0x47
		&& data[4] === 0x0d
		&& data[5] === 0x0a
		&& data[6] === 0x1a
		&& data[7] === 0x0a
	);
}

function isJpeg(data: Uint8Array) {
	return (
		data.byteLength >= 3
		&& data[0] === 0xff
		&& data[1] === 0xd8
		&& data[2] === 0xff
	);
}

function isBmp(data: Uint8Array) {
	return data.byteLength >= 2 && data[0] === 0x42 && data[1] === 0x4d;
}

function isWav(data: Uint8Array) {
	return (
		data.byteLength >= 12
		&& TEXT_DECODER.decode(data.subarray(0, 4)) === "RIFF"
		&& TEXT_DECODER.decode(data.subarray(8, 12)) === "WAVE"
	);
}

function isOgg(data: Uint8Array) {
	return (
		data.byteLength >= 4 && TEXT_DECODER.decode(data.subarray(0, 4)) === "OggS"
	);
}

function isTtf(data: Uint8Array) {
	if (data.byteLength < 4) {
		return false;
	}

	// TrueType font
	if (
		data[0] === 0x00
		&& data[1] === 0x01
		&& data[2] === 0x00
		&& data[3] === 0x00
	) {
		return true;
	}

	// OpenType
	if (TEXT_DECODER.decode(data.subarray(0, 4)) === "OTTO") {
		return true;
	}

	return false;
}

function isS3m(data: Uint8Array) {
	if (data.byteLength < 0x30) {
		return false;
	}

	const marker = TEXT_DECODER.decode(data.subarray(0x2c, 0x30));
	return marker === "SCRM";
}

function isZip(data: Uint8Array) {
	return data.byteLength >= 2 && data[0] === 0x50 && data[1] === 0x4b;
}

export function sanitizeFileName(fileName: string) {
	return fileName.replace(/[^\w\-_. ]+/g, "");
}
