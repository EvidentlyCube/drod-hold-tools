import {Signal} from "signals";

export const UINT_MINUS_1 = 4294967295;

export interface Point {
	x: number;
	y: number;
}

export interface HoldOperator {
	readonly isRunning: boolean;
	readonly currentStepName: string;
	readonly lastError: string;
	readonly fileName: string;
	readonly progressFactor: number;
	readonly onUpdate: Signal;
}