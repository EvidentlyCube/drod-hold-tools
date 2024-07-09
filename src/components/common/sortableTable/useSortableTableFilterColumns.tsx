import { useCallback } from "react";
import useLocalStorageState from "use-local-storage-state";
import { SortableTableColumn, SortableTableDataWithId } from "./SortableTableCommons";
import SuperJSON from "superjson";

export default function useSortableTableFilterColumns<T extends SortableTableDataWithId>(
	columns: readonly SortableTableColumn<T>[],
	localStorageKey: string
) {
	const [columnFilters, setColumnFilters] = useLocalStorageState(`${localStorageKey}-filter`, {
		defaultValue: new Map<string, string>(),
		serializer: SuperJSON
	});

	const setColumnFilter = useCallback((column: string, filter: string) => {
		const newColumnFilters = new Map(columnFilters);

		if (!filter) {
			newColumnFilters.delete(column);
		} else {
			newColumnFilters.set(column, filter);
		}

		setColumnFilters(newColumnFilters);
	}, [ columnFilters, setColumnFilters ]);

	const filterableColumns = columns.filter(column => column.filter);

	return { filterableColumns, columnFilters, setColumnFilter };
}