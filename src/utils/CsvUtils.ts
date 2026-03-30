export function arrayToCsvString(rows: string[][]): string {
	return rows
		.map(row => row.map(cell => escapeCsvCell(cell)).join(","))
		.join("\r\n");
}

function escapeCsvCell(cell: string): string {
	if (cell.match(/[\n,"]/)) {
		return `"${cell.replace(/"/g, '""')}"`;
	} else {
		return cell;
	}
}
export function csvStringToArray(input: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;
	let i = 0;

	while (i < input.length) {
		const char = input[i];
		const next = input[i + 1];

		if (inQuotes) {
			if (char === '"' && next === '"') {
				field += '"';
				i += 2;
			} else if (char === '"') {
				// End of quoted field
				inQuotes = false;
				i++;
			} else {
				field += char;
				i++;
			}
		} else {
			if (char === '"' && field === "") {
				// Start of quoted field
				inQuotes = true;
				i++;
			} else if (char === ",") {
				row.push(field);
				field = "";
				i++;
			} else if (char === "\r" && next === "\n") {
				// Windows line ending
				row.push(field);
				rows.push(row);
				row = [];
				field = "";
				i += 2;
			} else if (char === "\n" || char === "\r") {
				// Unix / old Mac line ending
				row.push(field);
				rows.push(row);
				row = [];
				field = "";
				i++;
			} else {
				field += char;
				i++;
			}
		}
	}

	if (row.length > 0 || field) {
		row.push(field);
	}

	if (row.length > 0) {
		rows.push(row);
	}

	return rows;
}
