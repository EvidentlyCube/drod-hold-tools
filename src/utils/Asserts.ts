
export function assertNotNull<T>(value: T | undefined | null, message: string, ...context: any[]): asserts value is T {
	if (value === null) {
		if (context.length) {
			console.error(...context);
		}
		throw new Error(`Not null assert: ${message}`);
	} else if (value === undefined) {
		if (context.length) {
			console.error(...context);
		}
		throw new Error(`Not undefined assert: ${message}`);
	}
}
