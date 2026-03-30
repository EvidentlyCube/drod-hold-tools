import { useCallback, useMemo } from "react";
import useLocalStorageState from "use-local-storage-state";
import { TurboJson } from "../../../utils/TurboJson";
import type {
	SortableTableColumn,
	SortableTableDataWithId,
} from "./SortableTableCommons";

export default function useSortableTableFilterColumns<
	T extends SortableTableDataWithId,
>(columns: readonly SortableTableColumn<T>[], localStorageKey: string) {
	const [columnFilters, setColumnFilters] = useLocalStorageState(
		`${localStorageKey}-filter_v3`,
		{
			defaultValue: new Map<string, string>(),
			serializer: TurboJson,
		},
	);

	if (!(columnFilters instanceof Map)) {
		throw new Error("NOT A MAP");
	}

	const setColumnFilter = useCallback(
		(column: string, filter: string) => {
			const newColumnFilters = new Map(columnFilters);

			if (!filter) {
				newColumnFilters.delete(column);
			} else {
				newColumnFilters.set(column, filter);
			}

			setColumnFilters(newColumnFilters);
		},
		[columnFilters, setColumnFilters],
	);

	const filterableColumns = useMemo(() => {
		return columns.filter(column => column.filter);
	}, [columns]);

	return { filterableColumns, columnFilters, setColumnFilter };
}
