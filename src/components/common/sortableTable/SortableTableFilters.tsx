import { useDebouncedCallback } from "use-debounce";
import Select from "../Select";
import {
	SortableTableColumn,
	SortableTableDataWithId,
} from "./SortableTableCommons";

interface Props<T extends SortableTableDataWithId> {
	columns: SortableTableColumn<T>[];
	columnFilters: Map<string, string>;
	setColumnFilter: (column: string, filter: string) => void;
}
export function SortableTableFilters<T extends SortableTableDataWithId>(
	props: Props<T>
) {
	const { columns, columnFilters, setColumnFilter } = props;

	if (columns.find((column) => column.filter) === undefined) {
		return null;
	}

	return (
		<tr>
			{columns.map((column) => (
				<th key={column.id}>
					{column.filter && (
						<FilterInput
							column={column}
							columnFilters={columnFilters}
							setColumnFilter={setColumnFilter}
						/>
					)}
				</th>
			))}
		</tr>
	);
}

interface FilterInputProps<T extends SortableTableDataWithId> {
	column: SortableTableColumn<T>;
	columnFilters: Map<string, string>;
	setColumnFilter: (column: string, filter: string) => void;
}
export function FilterInput<T extends SortableTableDataWithId>(
	props: FilterInputProps<T>
) {
	const { column, columnFilters, setColumnFilter } = props;

	const setFilter = useDebouncedCallback((column: string, filter: string) => {
		setColumnFilter(column, filter)
	}, column.filterDebounce ?? 0)

	if (column.filterOptions) {
		return (
			<div className="control has-icons-left">
				<Select
					className="is-small is-rounded"
					emptyOption="Filter..."
					options={column.filterOptions.options}
					optgroups={column.filterOptions.optgroups}
					onChange={value => setFilter(column.id, value)}
					value={columnFilters.get(column.id)}
				/>
				<span className="icon is-small is-left">
					<i className="fas fa-magnifying-glass"></i>
				</span>
			</div>
		);

	} else {
		return (
			<div className="control has-icons-left">
				<input
					className="input is-small is-rounded"
					defaultValue={columnFilters.get(column.id) ?? ""}
					placeholder="Filter..."
					onInput={(e) =>
						setFilter(column.id, e.currentTarget.value)
					}
				/>
				<span className="icon is-small is-left">
					<i className="fas fa-magnifying-glass"></i>
				</span>
			</div>
		);
	}
}
