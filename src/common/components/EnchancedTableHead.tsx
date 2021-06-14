import {TableCell, TableHead, TableRow, TableSortLabel} from "@material-ui/core";
import React from "react";
import {EnchancedTableColumn} from "./EnchancedTableCommons";
import {LightTooltip} from "./LightTooltip";


interface EnchancedTableHeadProps {
	orderBy: string;
	orderDir: 'asc' | 'desc';
	onSort: (field: string) => void;
	columns: EnchancedTableColumn[];
}

export class EnchancedTableHead extends React.Component<EnchancedTableHeadProps> {
	public render() {
		const {columns} = this.props;

		return (
			<TableHead>
				<TableRow>
					{columns.map(column => this.renderHeader(column))}
				</TableRow>
			</TableHead>
		);
	}

	private renderHeader(column: EnchancedTableColumn) {
		const {orderBy, orderDir, onSort} = this.props;
		const align = column.type === 'numeric' ? 'right' : 'left';
		const isSortingColumn = orderBy === column.id;
		const sortHandler = column.sortable !== false ? () => onSort(column.id) : undefined;

		let middle = <TableSortLabel
			active={isSortingColumn}
			direction={isSortingColumn ? orderDir : "asc"}
			onClick={sortHandler}
		>
			{column.label}
		</TableSortLabel>;

		if (column.headerTitle) {
			middle = <LightTooltip title={column.headerTitle}>{middle}</LightTooltip>
		}

		return (
			<TableCell
				key={column.id}
				align={align}
				sortDirection={isSortingColumn ? orderDir : false}
			>
				{middle}
			</TableCell>
		);
	}
}