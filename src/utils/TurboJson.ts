

export const TurboJson = {

	stringify: (value: unknown): string => {
		return JSON.stringify(value, function (key, value) {
			if (this[key] instanceof Set) {
				return { $$$CLASS: 'Set', values: Array.from(this[key].values()) }
			} else if (this[key] instanceof Map) {
				return { $$$CLASS: 'Map', values: Array.from(this[key].entries()) }
			}

			return value;
		})
	},
	parse: (value: string): unknown => {
		return JSON.parse(value, function(key, value) {
			if (typeof value !== 'object' || !('$$$CLASS' in value)) {
				return value;
			}

			switch (value.$$$CLASS) {
				case 'Set':
					return new Set(value.values);

				case 'Map':
					return new Map(value.values);

				default:
					return undefined;
			}
		})
	}
}