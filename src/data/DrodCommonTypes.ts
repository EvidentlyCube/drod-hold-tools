export const INT_MAX = 2147483647;
export const UINT_MAX = 4294967296;
export const UINT_MINUS_1 = 4294967295;
export const DEFAULT_PROCESSING_SEQUENCE = 1000;
export const CUSTOM_CHARACTER_FIRST = 20000;

export interface Point {
	x: number;
	y: number;
}

export enum ImportExportTextRowType {
	Speech = "Speech",
	CharacterName = "Character Name",
	DataName = "Data Name",
	LevelName = "Level Name",
	PlayerName = "Player Name",
	ScrollText = "Scroll Text",
	EntranceText = "Entrance Text",
}
