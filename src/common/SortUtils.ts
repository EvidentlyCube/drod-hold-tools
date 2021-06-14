import {EnchancedTableColumnType} from "./components/EnchancedTableCommons";

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
	if (right < left) {
		return -1;
	}
	if (right > left) {
		return 1;
	}
	return 0;
}

function sanitizeForNumber(field: any) {
	switch (typeof field) {
		case "string":
			return parseInt(field);
		case "number":
			return field;
		case "boolean":
			return field ? 1 : 0;
		default:
			return Number.NaN;
	}
}

function descendingComparatorForNumber<T>(a: T, b: T, orderBy: keyof T) {
	const left = sanitizeForNumber(a[orderBy]);
	const right = sanitizeForNumber(b[orderBy]);

	if (Number.isNaN(left) && Number.isNaN(right)) {
		return descendingComparatorForString(a, b, orderBy);
	} else if (Number.isNaN(left)) {
		return 1;
	} else if (Number.isNaN(right)) {
		return -1;
	} else {
		return right - left;
	}
}

export const SortUtils = {
	getComparator<T, >(
		order: 'asc' | 'desc',
		orderBy: keyof T,
		fieldType?: EnchancedTableColumnType
	): (a: T, b: T) => number {
		if (fieldType === 'numeric') {
			return order === "desc"
				? (a, b) => descendingComparatorForNumber(a, b, orderBy)
				: (a, b) => -descendingComparatorForNumber(a, b, orderBy);
		}

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
};