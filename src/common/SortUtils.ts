function sanitize(field: any) {
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

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	const left = sanitize(a[orderBy]);
	const right = sanitize(b[orderBy]);
	if (right < left) {
		return -1;
	}
	if (right > left) {
		return 1;
	}
	return 0;
}

export const SortUtils = {
	getComparator<T, >(
		order: 'asc' | 'desc',
		orderBy: keyof T,
	): (a: T, b: T) => number {
		return order === "desc"
			? (a, b) => descendingComparator(a, b, orderBy)
			: (a, b) => -descendingComparator(a, b, orderBy);
	},

	stableSort<T>(array: T[], uniqueField: keyof T, comparator: (a: T, b: T) => number) {
		const stabilizedThis = array.map(el => [el, el[uniqueField]] as [T, any]);

		stabilizedThis.sort((a, b) => {
			const order = comparator(a[0], b[0]);
			if (order !== 0) return order;
			return a[1] - b[1];
		});

		return stabilizedThis.map((el) => el[0]);
	},
};