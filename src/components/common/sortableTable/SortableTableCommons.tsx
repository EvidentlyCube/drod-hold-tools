import type { ReactNode } from "react";
import type { OptGroup, Option } from "../Select";

export interface SortableTableDataWithId {
	id: string | number;
}

export interface SortableTableColumnSansData {
	id: string;
	displayName: string;

	widthPercent: number;
	canHide?: boolean;
	className?: string;
	filterOptions?: { options?: Option[]; optgroups?: OptGroup[] };
	filterDebounce?: number;
}

export interface SortableTableColumn<TData extends SortableTableDataWithId>
	extends SortableTableColumnSansData {
	render: (data: TData) => ReactNode;
	sort?: (isAsc: boolean, left: TData, right: TData) => number;
	filter?: (data: TData, filter: string) => boolean;
}
