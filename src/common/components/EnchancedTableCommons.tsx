import React from "react";

export type EnchancedTableColumnType = 'text' | 'numeric';

export interface EnchancedTableColumn {
	id: string;
	label: string;

	padding?: 'normal' | 'checkbox' | 'none';
	type?: EnchancedTableColumnType;
	sortable?: boolean;
	editable?: boolean;
	width?: string;
	headerTitle?: string;

	renderCell?: (row: any) => React.ReactNode;
	renderEditor?: (row: any, onCancel: () => void, onSave: (value: string) => void) => React.ReactNode;

	editMaxLength?: number;
	editMultiline?: boolean;
}