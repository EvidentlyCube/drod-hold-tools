
export const UINT_MINUS_1 = 4294967295;
export const DEFAULT_PROCESSING_SEQUENCE = 1000;
export const CUSTOM_CHARACTER_FIRST = 20000;

export interface Point {
	x: number;
	y: number;
}

export type OnProgressCallback = (step: string, progressFactor: number, context: string) => void;
