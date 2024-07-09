import { SortableTableColumnSansData } from "./SortableTableCommons";

interface Props {
	columns: readonly SortableTableColumnSansData[];
	hiddenColumns: Set<string>;
	toggleHiddenColumn: (column: string) => void;
}

export default function SortableTableColumnOptions(props: Props) {
	const { columns, hiddenColumns, toggleHiddenColumn } = props;
	const hidableColumns = columns.filter((column) => column.canHide);

	if (hidableColumns.length === 0) {
		return null;
	}

	return (
		<div className="dropdown is-hoverable">
			<div className="dropdown-trigger">
				<button
					className="button"
					aria-haspopup="true"
					aria-controls="dropdown-menu4"
				>
					<span className="icon is-small">
						<i className="fas fa-gear" aria-hidden="true"></i>
					</span>
				</button>
			</div>
			<div className="dropdown-menu" id="dropdown-menu4" role="menu">
				<div className="dropdown-content has-text-left">
					<div className="dropdown-item">
						<strong>Visible columns:</strong>
					</div>
					{hidableColumns.map((column) => (
						<HideColumn
							key={column.id}
							column={column}
							hiddenColumns={hiddenColumns}
							toggleHiddenColumn={toggleHiddenColumn}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

interface HideColumnProps {
	column: SortableTableColumnSansData;
	hiddenColumns: Set<string>;
	toggleHiddenColumn: (column: string) => void;
}
function HideColumn(props: HideColumnProps) {
	const { column, hiddenColumns, toggleHiddenColumn } = props;

	const isHidden = hiddenColumns.has(column.id);

	return (
		<label className="checkbox dropdown-item">
			<input
				type="checkbox"
				checked={!isHidden}
				onChange={() => toggleHiddenColumn(column.id)}
			/>{" "}
			{column.displayName}
		</label>
	);
}
