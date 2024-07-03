import { useCallback } from "react";
import useLocalStorageState from "use-local-storage-state";
import { SortableTableColumn, SortableTableDataWithId } from "./SortableTableCommons";

export default function useSortableTableHiddenColumns<T extends SortableTableDataWithId>(
	columns: SortableTableColumn<T>[],
	localStorageKey: string
) {
	const [hiddenColumns, setHiddenColumns] = useLocalStorageState(localStorageKey, {
		defaultValue: new Set<string>()
	});

	const toggleHiddenColumn = useCallback((column: string) => {
		const newHiddenColumns = new Set(hiddenColumns);

		if (hiddenColumns.has(column)) {
			newHiddenColumns.delete(column);
		} else {
			newHiddenColumns.add(column)
		}

		setHiddenColumns(newHiddenColumns);
	}, [ hiddenColumns, setHiddenColumns ]);

	const filteredColumns = columns.filter(column => !hiddenColumns.has(column.id));

	return { filteredColumns, hiddenColumns, toggleHiddenColumn };
}