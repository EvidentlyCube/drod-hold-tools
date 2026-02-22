import { UINT_MINUS_1 } from "../data/DrodCommonTypes";

/**
 * Simple cast of a number to a C++ compatible UINT. Used to
 * work with a bunch of DROD constants and enums.
 */
export function UINT(i: number): number {
	if (i < 0) {
		return UINT_MINUS_1 + 1 + i;
	}

	return i;
}