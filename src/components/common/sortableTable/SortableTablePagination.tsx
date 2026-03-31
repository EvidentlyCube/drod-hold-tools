import { memo, useCallback } from "react";
import SortableTableColumnOptions from "./SortableTableColumnOptions";
import type { SortableTableColumnSansData } from "./SortableTableCommons";
import {
	getPaginationPageNumbers,
	PAGINATION_ELLIPSIS_BUTTON,
} from "./SortableTableUtils";

interface PaginationProps {
	totalRecords: number;
	pageSize: number;
	currentPage: number;
	setPage: (page: number) => void;
	columns: readonly SortableTableColumnSansData[];
	hiddenColumns: Set<string>;
	toggleHiddenColumn: (column: string) => void;
}
function SortableTablePaginationRaw(props: PaginationProps) {
	const {
		totalRecords,
		pageSize,
		currentPage,
		setPage,
		columns,
		hiddenColumns,
		toggleHiddenColumn,
	} = props;

	const pages = Math.max(1, Math.ceil(totalRecords / pageSize));
	const isFirst = currentPage === 0;
	const isLast = currentPage === pages - 1;

	const setPageSafe = useCallback(
		(page: number) => {
			page = Math.max(0, page);
			page = Math.min(pages - 1, page);

			setPage(page);
		},
		[pages, setPage],
	);
	const setPrevPage = useCallback(
		() => setPageSafe(currentPage - 1),
		[currentPage, setPageSafe],
	);
	const setNextPage = useCallback(
		() => setPageSafe(currentPage + 1),
		[currentPage, setPageSafe],
	);

	const pageNumbers = getPaginationPageNumbers(currentPage, pages);

	return (
		<nav className="pagination">
			<SortableTableColumnOptions
				columns={columns}
				hiddenColumns={hiddenColumns}
				toggleHiddenColumn={toggleHiddenColumn}
			/>

			<button
				type="button"
				className={
					isFirst ? "is-disabled pagination-previous" : "pagination-previous"
				}
				onClick={setPrevPage}
			>
				Previous
			</button>
			<button
				type="button"
				className={isLast ? "is-disabled pagination-next" : "pagination-next"}
				onClick={setNextPage}
			>
				Next page
			</button>
			<ul className="pagination-list">
				{pageNumbers.map(pageNumber => (
					<li key={pageNumber}>
						<PaginationLink
							linkingPage={pageNumber}
							setPage={setPageSafe}
							selected={currentPage}
						/>
					</li>
				))}
				{currentPage >= pages && (
					<div className="pagination-link has-background-danger-light">
						{currentPage + 1}&nbsp;<em>(wrong page)</em>
					</div>
				)}
			</ul>
		</nav>
	);
}

export const SortableTablePagination = memo(
	SortableTablePaginationRaw,
) as typeof SortableTablePaginationRaw;
interface PaginationLinkProps {
	selected: number;
	setPage: (page: number) => void;
	linkingPage: number;
}
function PaginationLink({
	selected,
	linkingPage,
	setPage,
}: PaginationLinkProps) {
	const handleClick = useCallback(
		() => setPage(linkingPage),
		[setPage, linkingPage],
	);

	if (linkingPage === PAGINATION_ELLIPSIS_BUTTON) {
		return <span className="pagination-ellipsis">&hellip;</span>;
	} else {
		return (
			<button
				type="button"
				className={
					selected === linkingPage
						? "is-current pagination-link"
						: "pagination-link"
				}
				onClick={handleClick}
			>
				{linkingPage + 1}
			</button>
		);
	}
}
