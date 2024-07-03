import { useCallback, useState } from "react";

export default function useSortableTableSort(defaultSort: string) {
	const [sortBy, setSortBy] = useState(defaultSort);
	const [sortAsc, setSortAsc] = useState(true);

	const onSort = useCallback(
		(newSortBy: string) => {
			if (newSortBy === sortBy) {
				setSortAsc(!sortAsc);
			} else {
				setSortBy(newSortBy);
				setSortAsc(true);
			}
		},
		[setSortBy, setSortAsc, sortAsc, sortBy]
	);

	return { sortBy, sortAsc, onSort };
}
