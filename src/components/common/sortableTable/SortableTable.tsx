import { useMemo, useState } from "react";
import { SortableTableColumn, SortableTableDataWithId } from "./SortableTableCommons";
import SortableTableHeaderCell from "./SortableTableHeader";
import { SortableTablePagination } from "./SortableTablePagination";
import useSortableTableSort from "./useSortableTableSort";
import useSortableTableHiddenColumns from "./useSortableTableHiddenColumns";
import useSortableTableFilterColumns from "./useSortableTableFilterColumns";
import { SortableTableFilters } from "./SortableTableFilters";


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
	const { visibleColumns, hiddenColumns, toggleHiddenColumn } = useSortableTableHiddenColumns(columns, tableId);
	const { filterableColumns, columnFilters, setColumnFilter } = useSortableTableFilterColumns(columns, tableId)
	const [page, setPage] = useState(0);

	const filteredRows = useMemo(() => {
		return rows.filter(row => {
			for (const column of filterableColumns) {
				const filter = columnFilters.get(column.id);

				if (filter && column.filter && !column.filter(row, filter)) {
					return false;
				}
			}

			return true;
		});

	}, [rows, filterableColumns, columnFilters])

	const sortedRows = useMemo(() => {
		const sortColumn = columns.find(column => column.id === sortBy);

		return sortColumn && sortColumn.sort
			? filteredRows.concat().sort(sortColumn.sort.bind(undefined, sortAsc))
			: filteredRows;

	}, [filteredRows, columns, sortBy, sortAsc]);
	const paginatedRows = useMemo(() => {
		return sortedRows.slice(page * pageSize, page * pageSize + pageSize - 1)
	}, [page, sortedRows, pageSize]);

	return <table className={className}>
		<thead>
			<tr>
				<td colSpan={visibleColumns.length}>
					<SortableTablePagination
						currentPage={page}
						pageSize={pageSize}
						setPage={setPage}
						totalRecords={filteredRows.length}
						columns={columns}
						hiddenColumns={hiddenColumns}
						toggleHiddenColumn={toggleHiddenColumn}
					/>
				</td>
			</tr>
			<tr>
				{visibleColumns.map(column => <SortableTableHeaderCell
					key={column.id}
					column={column}
					onSort={onSort}
					sortBy={sortBy}
					sortAsc={sortAsc} /> )}
			</tr>
			<SortableTableFilters
				columns={columns}
				columnFilters={columnFilters}
				setColumnFilter={setColumnFilter}
			/>
		</thead>
		<tbody>
			{paginatedRows.map((row, index) => <Row key={row.id} columns={visibleColumns} data={row} />)}
			{paginatedRows.length === 0 && <tr>
				<td colSpan={visibleColumns.length}>
					<div className="container has-text-centered">
						Empty Table
					</div>
				</td>
			</tr>}
		</tbody>
		<tfoot>
			<tr>
				<td colSpan={columns.length}>
					<SortableTablePagination
						currentPage={page}
						pageSize={pageSize}
						setPage={setPage}
						totalRecords={filteredRows.length}
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
