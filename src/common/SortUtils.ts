const naturalSort = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

function sanitizeForString(field: any) {
	switch (typeof field) {
		case "string":
			return field.toLowerCase();
		case "number":
			return field.toString();
		case "boolean":
			return field ? "1" : "0";
		default:
			return "";
	}
}

function descendingComparatorForString<T>(a: T, b: T, orderBy: keyof T) {
	const left = sanitizeForString(a[orderBy]);
	const right = sanitizeForString(b[orderBy]);

	return naturalSort.compare(left, right);
}

export const SortUtils = {
	getComparator<T, >(
		order: 'asc' | 'desc',
		orderBy: keyof T,
	): (a: T, b: T) => number {
		return order === "desc"
			? (a, b) => descendingComparatorForString(a, b, orderBy)
			: (a, b) => -descendingComparatorForString(a, b, orderBy);
	},

	stableSort<T>(array: T[], uniqueField: keyof T, comparator: (a: T, b: T) => number) {
		const stabilizedThis = array.map(el => [el, el[uniqueField]] as [T, any]);

		stabilizedThis.sort((a, b) => {
			const order = comparator(a[0], b[0]);

			return order !== 0
				? order
				: a[1] - b[1];
		});

		return stabilizedThis.map((el) => el[0]);
	},

	compareOptionalNumber(a?: number, b?: number) {
		if (a === undefined && b === undefined) {
			return 0;
		} else if (a === undefined) {
			return -1;
		} else if (b === undefined) {
			return 1;
		} else {
			return a - b;
		}
	},

	compareOptionalString(a?: string, b?: string) {
		if (a === undefined && b === undefined) {
			return 0;
		} else if (a === undefined) {
			return -1;
		} else if (b === undefined) {
			return 1;
		} else if (a < b) {
			return -1;
		} else if (a > b) {
			return 1;
		} else {
			return 0;
		}
	},

	naturalSort: naturalSort.compare
};