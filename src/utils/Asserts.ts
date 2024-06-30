
export function assertNotNull<T>(value: T | undefined | null, message: string): asserts value is T {
	if (value === null) {
		throw new Error(`Not null assert: ${message}`);
	} else if (value === undefined) {
		throw new Error(`Not undefined assert: ${message}`);
	}
}
