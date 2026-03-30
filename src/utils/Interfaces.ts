// Eslint error disabled because the function is used to compile-time check
// that enums are exhaustively checked
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function shouldBeUnreachable(_: never) {}

export type HoldReadProgressLog = (
	step: string,
	progressFactor: number,
	context: string,
) => void;
