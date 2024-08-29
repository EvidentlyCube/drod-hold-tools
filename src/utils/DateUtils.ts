import { formatString } from "./StringUtils";

export function formatDateTimeForInput(timestamp: number) {
	const date = new Date(timestamp);

	return formatString(
		"%-%-%T%:%",
		date.getFullYear().toString().padStart(4, "0"),
		(date.getMonth() + 1).toString().padStart(2, "0"),
		date.getDate().toString().padStart(2, "0"),
		date.getHours().toString().padStart(2, "0"),
		date.getMinutes().toString().padStart(2, "0"),
	)
}