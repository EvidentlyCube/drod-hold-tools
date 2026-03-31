import { useCallback } from "react";
import type {
	SortableTableColumn,
	SortableTableDataWithId,
} from "./SortableTableCommons";

interface SortIconProps {
	currentSortBy: string;
	thisSortBy: string;
	sortAsc: boolean;
}
function SortIcon({ currentSortBy, thisSortBy, sortAsc }: SortIconProps) {
	if (currentSortBy !== thisSortBy) {
		return <i className="fa-solid fa-sort"></i>;
	} else if (sortAsc) {
		return <i className="fa-solid fa-sort-asc"></i>;
	} else {
		return <i className="fa-solid fa-sort-desc"></i>;
	}
}

interface HeaderProps<TData extends SortableTableDataWithId> {
	column: SortableTableColumn<TData>;
	onSort: (id: string) => void;
	sortBy: string;
	sortAsc: boolean;
}
export default function SortableTableHeaderCell<
	TData extends SortableTableDataWithId,
>({ column, onSort, sortBy, sortAsc }: HeaderProps<TData>) {
	const style = { width: `${column.widthPercent}%` };
	const onSortInner = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			onSort(column.id);
		},
		[column, onSort],
	);

	if (column.sort) {
		return (
			<th style={style}>
				<a href="/" onClick={onSortInner}>
					{column.displayName}
					<span className="icon">
						<SortIcon
							currentSortBy={sortBy}
							thisSortBy={column.id}
							sortAsc={sortAsc}
						/>
					</span>
				</a>
			</th>
		);
	} else {
		return <th style={style}>{column.displayName}</th>;
	}
}
