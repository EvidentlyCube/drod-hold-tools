import { Constants } from "../Constants";

// These functions are used to split long running async tasks
// into pieces that don't block the UI

let lastSleep = 0;

export function shouldYieldToUi() {
	// Guard to avoid immediately yielding on the first check
	lastSleep = lastSleep || Date.now();

	return lastSleep + Constants.yieldFrameDuration < Date.now();
}

export async function tryToYieldToUi() {
	if (shouldYieldToUi()) {
		await yieldToUi();
	}
}

export async function yieldToUi() {
	await new Promise<void>(resolve => setTimeout(() => {
		lastSleep = Date.now();
		resolve();
	}, Constants.yieldSleepDuration));
}