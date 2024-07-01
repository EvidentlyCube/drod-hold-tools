import { ReactElement, useCallback, useMemo, useState } from "react";

interface DataWithId {
	id: string|number;
}
export interface Column<TData extends DataWithId> {
	id: string;
	displayName: string;

	widthPercent: number;

	render: (data: TData) => ReactElement[] | ReactElement | string | number;
	sort?: (isAsc: boolean, left: TData, right: TData) => number;
}

interface Props<TData extends DataWithId> {
	columns: Column<TData>[];
	className?: string;
	rows: TData[];
	pageSize: number;
}
export default function SortableTable<TData extends DataWithId>({ columns, rows, className, pageSize }: Props<TData>) {
	const [sortBy, setSortBy] = useState(columns[0].id);
	const [sortAsc, setSortAsc] = useState(true);
	const [page, setPage] = useState(0);

	const sortedRows = useMemo(() => {
		const sortColumn = columns.find(column => column.id === sortBy);

		return sortColumn && sortColumn.sort
			? rows.concat().sort(sortColumn.sort.bind(undefined, sortAsc))
			: rows;

	}, [rows, columns, sortBy, sortAsc]);
	const paginatedRows = useMemo(() => {
		return sortedRows.slice(page * pageSize, page * pageSize + pageSize - 1)
	}, [page, sortedRows, pageSize])

	const onSort = useCallback((newSortBy: string) => {
		if (newSortBy === sortBy) {
			setSortAsc(!sortAsc);

		} else {
			setSortBy(newSortBy);
			setSortAsc(true);
		}
	}, [setSortBy, setSortAsc, sortAsc, sortBy])

	return <table className={className}>
		<thead>
			<tr>
				{columns.map(column => <Header
					key={column.id}
					column={column}
					onSort={onSort}
					sortBy={sortBy}
					sortAsc={sortAsc} /> )}
			</tr>
		</thead>
		<tbody>
			{paginatedRows.map((row, index) => <Row key={row.id} columns={columns} data={row} />)}
		</tbody>
		<tfoot>
			<tr>
				<td colSpan={columns.length}>
					<Pagination
						currentPage={page}
						pageSize={pageSize}
						setPage={setPage}
						totalRecords={rows.length} />
				</td>
			</tr>
		</tfoot>
	</table>
}

interface HeaderProps<TData extends DataWithId> {
	column: Column<TData>;
	onSort: (id: string) => void;
	sortBy: string;
	sortAsc: boolean;
}
function Header<TData extends DataWithId>({column, onSort, sortBy, sortAsc}: HeaderProps<TData>) {
	const style = { width: `${column.widthPercent}%` };
	if (column.sort) {
		return <th style={ style }>
			<a href="/" onClick={(e) => {
				e.preventDefault();
				onSort(column.id)
			}}>
				{column.displayName}
				<span className="icon">
					<SortIcon currentSortBy={sortBy} thisSortBy={column.id} sortAsc={sortAsc} />
				</span>
			</a>
		</th>
	} else {
		return <th style={ style }>{column.displayName}</th>;
	}
}
interface SortIconProps {
	currentSortBy: string;
	thisSortBy: string;
	sortAsc: boolean;
}
function SortIcon({currentSortBy, thisSortBy, sortAsc}:SortIconProps) {
	if (currentSortBy !== thisSortBy) {
		return <i className="fa-solid fa-sort"></i>
	} else if (sortAsc) {
		return <i className="fa-solid fa-sort-asc"></i>
	} else {
		return <i className="fa-solid fa-sort-desc"></i>
	}
}

interface RowProps<TData extends DataWithId> {
	columns: Column<TData>[];
	data: TData;
}
function Row<TData extends DataWithId>({columns, data}: RowProps<TData>) {
	return <tr>
			{columns.map(column => <td key={column.id}>{column.render(data)}</td>)}
	</tr>
}

interface PaginationProps {
	totalRecords: number;
	pageSize: number;
	currentPage: number;
	setPage: (page: number) => void;
}
function Pagination({ totalRecords, pageSize, currentPage, setPage }: PaginationProps) {
	const pages = Math.ceil(totalRecords / pageSize);
	const isFirst = currentPage === 0;
	const isLast = currentPage === pages - 1;

	const setPageSafe = useCallback((page: number) => {
		page = Math.max(0, page);
		page = Math.min(pages - 1, page);

		setPage(page);
	}, [pages, setPage]);

	const pageNumbers = paginate(currentPage, pages);

	return (
		<nav
			className="pagination is-centered"
		>
			<button
					className={ isFirst ? "is-disabled pagination-previous" : "pagination-previous" }
					onClick={() => setPageSafe(currentPage - 1)}
			>
				Previous
			</button>
			<button
					className={ isLast ? "is-disabled pagination-next" : "pagination-next" }
					onClick={() => setPageSafe(currentPage + 1)}
			>
				Next page
			</button>
			<ul className="pagination-list">
				{
					pageNumbers.map(pageNumber => <li key={pageNumber}><PaginationLink
						linkingPage={pageNumber}
						setPage={setPageSafe}
						selected={currentPage}
					/>
					</li>)
				}
			</ul>
		</nav>
	);
}

interface PaginationLinkProps {
	selected: number;
	setPage: (page: number) => void;
	linkingPage: number | string;
}
function PaginationLink({selected, linkingPage: current, setPage}: PaginationLinkProps) {
	if (typeof current === 'string') {
		return <span className="pagination-ellipsis">
			&hellip;
		</span>;
	} else {
		return <button
			className={ selected === current ? "is-current pagination-link" : 'pagination-link' }
			onClick={() => setPage(current)}
		>
			{current + 1}
		</button>
	}
}

function paginate(page: number, total: number) {
	const lastPage = total - 1;
	const items: (number|string)[] = [0];
	if (total <= 1) {
		return items;
	}

	if (page > 3) {
		items.push('ellipsis-1');
	}

	let lookahead = 2;
	let pagesFrom = Math.max(1, page - lookahead);
	let pagesTo = Math.min(lastPage - 1, page + lookahead);

	for (let i = pagesFrom; i <= pagesTo; i++) {
		items.push(i);
	}

	if (pagesTo + 1 < lastPage) {
		items.push('ellipsis-2');
	}

	if (pagesTo < lastPage) {
		items.push(lastPage);
	}

	return items;
}