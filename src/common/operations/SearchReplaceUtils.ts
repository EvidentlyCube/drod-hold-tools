
const IsRegexRegex = /^\/.+?\/(?!.*(.).*\1)[imsu]*$/;

export const SearchReplaceUtils = {
	isRegex: (str: string) => IsRegexRegex.test(str)
}