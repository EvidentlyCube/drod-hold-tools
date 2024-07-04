import { useCallback } from "react";
import useLocalStorageState from "use-local-storage-state";
import { SortableTableColumn, SortableTableDataWithId } from "./SortableTableCommons";
import SuperJSON from "superjson";
import { useDebounce } from "use-debounce";

export default function useSortableTableFilterColumns<T extends SortableTableDataWithId>(
	columns: SortableTableColumn<T>[],
	localStorageKey: string
) {
	const [rawColumnFilters, setColumnFilters] = useLocalStorageState(`${localStorageKey}-filter`, {
		defaultValue: new Map<string, string>(),
		serializer: SuperJSON
	});

	const setColumnFilter = useCallback((column: string, filter: string) => {
		const newColumnFilters = new Map(rawColumnFilters);

		if (!filter) {
			newColumnFilters.delete(column);
		} else {
			newColumnFilters.set(column, filter);
		}

		setColumnFilters(newColumnFilters);
	}, [ rawColumnFilters, setColumnFilters ]);

	const [columnFilters] = useDebounce(rawColumnFilters, 500);

	const filterableColumns = columns.filter(column => column.filter);

	return { filterableColumns, columnFilters, setColumnFilter };
}