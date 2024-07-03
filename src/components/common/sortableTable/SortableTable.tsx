import { useMemo, useState } from "react";
import { SortableTableColumn, SortableTableDataWithId } from "./SortableTableCommons";
import SortableTableHeaderCell from "./SortableTableHeader";
import { SortableTablePagination } from "./SortableTablePagination";
import useSortableTableSort from "./useSortableTableSort";
import useSortableTableHiddenColumns from "./useSortableTableHiddenColumns";


interface Props<TData extends SortableTableDataWithId> {
	tableId: string;
	columns: SortableTableColumn<TData>[];
	className?: string;
	rows: TData[];
	pageSize: number;
}
export default function SortableTable<TData extends SortableTableDataWithId>(props: Props<TData>) {
	const { tableId, columns, rows, className, pageSize } = props;

	const { sortBy, sortAsc, onSort } = useSortableTableSort(columns[0].id ?? "id");
	const { filteredColumns, hiddenColumns, toggleHiddenColumn } = useSortableTableHiddenColumns(columns, tableId);
	const [page, setPage] = useState(0);

	const sortedRows = useMemo(() => {
		const sortColumn = columns.find(column => column.id === sortBy);

		return sortColumn && sortColumn.sort
			? rows.concat().sort(sortColumn.sort.bind(undefined, sortAsc))
			: rows;

	}, [rows, columns, sortBy, sortAsc]);
	const paginatedRows = useMemo(() => {
		return sortedRows.slice(page * pageSize, page * pageSize + pageSize - 1)
	}, [page, sortedRows, pageSize]);

	return <table className={className}>
		<thead>
			<tr>
				<td colSpan={filteredColumns.length}>
					<SortableTablePagination
						currentPage={page}
						pageSize={pageSize}
						setPage={setPage}
						totalRecords={rows.length}
						columns={columns}
						hiddenColumns={hiddenColumns}
						toggleHiddenColumn={toggleHiddenColumn}
					/>
				</td>
			</tr>
			<tr>
				{filteredColumns.map(column => <SortableTableHeaderCell
					key={column.id}
					column={column}
					onSort={onSort}
					sortBy={sortBy}
					sortAsc={sortAsc} /> )}
			</tr>
		</thead>
		<tbody>
			{paginatedRows.map((row, index) => <Row key={row.id} columns={filteredColumns} data={row} />)}
		</tbody>
		<tfoot>
			<tr>
				<td colSpan={columns.length}>
					<SortableTablePagination
						currentPage={page}
						pageSize={pageSize}
						setPage={setPage}
						totalRecords={rows.length}
						columns={columns}
						hiddenColumns={hiddenColumns}
						toggleHiddenColumn={toggleHiddenColumn}
					/>
				</td>
			</tr>
		</tfoot>
	</table>
}


interface RowProps<TData extends SortableTableDataWithId> {
	columns: SortableTableColumn<TData>[];
	data: TData;
}
function Row<TData extends SortableTableDataWithId>({columns, data}: RowProps<TData>) {
	return <tr>
			{columns.map(column => <td key={column.id}>{column.render(data)}</td>)}
	</tr>
}
