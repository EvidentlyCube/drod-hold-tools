import React from "react";
import {Padding} from "@material-ui/core";

export interface EnchancedTableColumn {
	id: string;
	label: string;

	padding?: Padding;
	type?: 'text' | 'numeric';
	sortable?: boolean;
	editable?: boolean;
	width?: string;
	renderCell?: (row: any) => React.ReactNode;

	editMaxLength?: number;
}