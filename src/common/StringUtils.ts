const SupportedChars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÁÂÃÄÅÆÇÉÊËÍÎÏÐÑÓÔÕÖ×ØÚÛÜÝÞßáâãäåæçéêëíîïðñóôõö÷øúûüýþÿŒœŠšŸƒˆ˜–—‘’‚“”„†‡•…‰‹›™";

export const StringUtils = {
	sprintf(text: string, ...replacements: (string | number | undefined)[]) {
		let index = 0;
		return text.replace(/%s/g, () => {
			const val = replacements[index++];
			if (val === undefined) {
				return '';
			}
			return val.toString();
		});
	},
	stringToWString(str: string) {
		const wchars = [];
		for (let i = 0; i < str.length; i++) {
			wchars[i * 2] = str.charAt(i);
			wchars[i * 2 + 1] = "\x00";
		}

		return wchars.join('');
	},
	bytesArrToBase64(arr: number[]) {
		return btoa(String.fromCharCode.apply(null, arr));
	},
	stringToHoldString(str: string, maxLength?: number) {
		str = str.replace(/\n/g, "\r");

		if (maxLength !== undefined && str.length > maxLength) {
			str = str.substr(0, str.length);
		}

		return btoa(StringUtils.stringToWString(str));
	},
	uint8ToString(arr: Uint8Array) {
		let s = "";
		for (let i = 0; i < arr.length; i++) {
			s += String.fromCharCode(arr[i]);
		}

		return s;
	},
	stringToUint8(str: string) {
		const arr = new Uint8Array(str.length);
		for (let i = 0; i < str.length; i++) {
			arr[i] = str.charCodeAt(i);
		}

		return arr;
	},
	escapeRegExp(str: string) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	},
	htmlEntities(str: string) {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	},
	removeUnsupportedCharacters(str: string) {
		return str.replace(SupportedCharsRegex, '');
	},
};
const SupportedCharsRegex = new RegExp("[^" + StringUtils.escapeRegExp(SupportedChars) + "]", 'g');