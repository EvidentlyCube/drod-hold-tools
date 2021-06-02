export const StringUtils = {
	stringToWString(str: string) {
		const wchars = [];
		for (let i = 0; i < str.length; i++) {
			wchars[i * 2] = str.charAt(i);
			wchars[i * 2 + 1] = "\x00";
		}

		return wchars.join('');
	},

};