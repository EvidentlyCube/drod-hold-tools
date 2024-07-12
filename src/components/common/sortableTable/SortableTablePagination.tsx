import { memo, useCallback } from "react";
import { getPaginationPageNumbers } from "./SortableTableUtils";
import SortableTableColumnOptions from "./SortableTableColumnOptions";
import { SortableTableColumnSansData } from "./SortableTableCommons";

interface PaginationProps {
	totalRecords: number;
	pageSize: number;
	currentPage: number;
	setPage: (page: number) => void;
	columns: readonly SortableTableColumnSansData[];
	hiddenColumns: Set<string>;
	toggleHiddenColumn: (column: string) => void;
}
function _SortableTablePagination(props: PaginationProps) {
	const { totalRecords, pageSize, currentPage, setPage, columns, hiddenColumns, toggleHiddenColumn } = props;

	const pages = Math.max(1, Math.ceil(totalRecords / pageSize));
	const isFirst = currentPage === 0;
	const isLast = currentPage === pages - 1;

	const setPageSafe = useCallback((page: number) => {
		page = Math.max(0, page);
		page = Math.min(pages - 1, page);

		setPage(page);
	}, [pages, setPage]);

	const pageNumbers = getPaginationPageNumbers(currentPage, pages);

	return (
		<nav className="pagination">
			<SortableTableColumnOptions
				columns={columns}
				hiddenColumns={hiddenColumns}
				toggleHiddenColumn={toggleHiddenColumn}
			/>

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
					pageNumbers.map(pageNumber => <li key={pageNumber}>
						<PaginationLink
							linkingPage={pageNumber}
							setPage={setPageSafe}
							selected={currentPage}
						/>
					</li>)
				}
				{currentPage >= pages && <div className="pagination-link has-background-danger-light">
					{currentPage + 1}&nbsp;<em>(wrong page)</em>
				</div>}
			</ul>
		</nav>
	);
}

export const SortableTablePagination = memo(_SortableTablePagination) as typeof _SortableTablePagination;
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
