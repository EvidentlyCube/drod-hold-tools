export const StringUtils = {
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
	stringToHoldString(str: string) {
		str = str.replace(/\n/g, "\r");

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
};