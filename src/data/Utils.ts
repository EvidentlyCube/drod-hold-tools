import { bytesArrToBase64 as bytesToBase64 } from "../utils/StringUtils";
import { MonsterIdToName, MoodIdToName, ScriptCommandType, ScriptCommandTypeToName } from "./DrodEnums";
import { Hold } from "./datatypes/Hold";

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
	return stringToUint8(atob(data));
}

export function stringToUint8(str: string) {
	const bytes = new Uint8Array(str.length);

	for (let i = 0; i < str.length; i++) {
		bytes[i] = str.codePointAt(i) ?? 0;
	}

	return bytes;
}

export function downloadBlob(data: Uint8Array, fileName: string, mimeType: string) {
	const blob = new Blob([data], {
		type: mimeType
	});

	const url = window.URL.createObjectURL(blob);
	downloadURL(url, fileName);
	setTimeout(function () {
		return window.URL.revokeObjectURL(url);
	}, 1000);
};

export function downloadURL(dataUrl: string, fileName: string) {
	const a = document.createElement('a');
	a.href = dataUrl;
	a.download = fileName;
	document.body.appendChild(a);
	a.style.display = 'none';
	a.click();
	a.remove();
};

function getXName(x: number) {
	if (x > 0) {
		return x + 'E';
	} else if (x < 0) {
		return -x + "W";
	} else {
		return '';
	}
}

function getYName(y: number) {
	if (y > 0) {
		return y + 'S';
	} else if (y < 0) {
		return -y + "N";
	} else {
		return '';
	}
}

export function getCoordinateName(x: number, y: number) {
	return x === 0 && y === 0
		? 'Entrance'
		: `${getYName(y)}${getXName(x)}`;
}

export function getCharacterName(hold: Hold, characterId: number): string {
	return MonsterIdToName.get(characterId)
		?? hold.characters.get(characterId)?.name.finalText
		?? `Unknown Character[${characterId}]`;
}

export function getCommandName(type: ScriptCommandType): string {
	return ScriptCommandTypeToName.get(type)
		?? `Unknown Command[${type}]`;
}

export function getSpeakerMood(mood: number): string {
	return MoodIdToName.get(mood) ?? 'Unknown';
}