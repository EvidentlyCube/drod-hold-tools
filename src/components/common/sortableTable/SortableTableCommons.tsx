import { ReactElement } from "react";

export interface SortableTableDataWithId {
	id: string|number;
}

export interface SortableTableColumnSansData {
	id: string;
	displayName: string;

	widthPercent: number;
	canHide?: boolean;
}

export interface SortableTableColumn<TData extends SortableTableDataWithId> extends SortableTableColumnSansData {
	id: string;
	displayName: string;

	widthPercent: number;
	canHide?: boolean;

	render: (data: TData) => ReactElement[] | ReactElement | string | number;
	sort?: (isAsc: boolean, left: TData, right: TData) => number;
}
