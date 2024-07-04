import { ReactElement } from "react";
import { OptGroup, Option } from "../Select";

export interface SortableTableDataWithId {
	id: string | number;
}

export interface SortableTableColumnSansData {
	id: string;
	displayName: string;

	widthPercent: number;
	canHide?: boolean;
	filterOptions?: { options?: Option[], optgroups?: OptGroup[] };
}

export interface SortableTableColumn<TData extends SortableTableDataWithId>
	extends SortableTableColumnSansData {
	render: (data: TData) => ReactElement[] | ReactElement | string | number;
	sort?: (isAsc: boolean, left: TData, right: TData) => number;
	filter?: (data: TData, filter: string) => boolean;
}
