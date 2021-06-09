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
	renderEditor?: (row: any, onCancel: () => void, onSave: (value: string) => void) => React.ReactNode;

	editMaxLength?: number;
	editMultiline?: boolean;
}