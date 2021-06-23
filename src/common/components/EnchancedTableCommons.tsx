import React from "react";

export type EnchancedTableColumnType = 'text' | 'numeric';

export interface EnchancedTableApi {
	rerender(): void;

	rerenderRow(id: any): void;

	setDelayedClickAway(enabled: boolean): void;

	suppressClickAwayForFrame(): void;

	disableClickAwayClose(): void;
}

export interface EnchancedTableColumn {
	id: string;
	label: string;

	padding?: 'normal' | 'checkbox' | 'none';
	type?: EnchancedTableColumnType;
	sortable?: boolean;
	editable?: boolean;
	width?: string;
	headerTitle?: string;
	visible?: boolean;

	cellClassName?: string;

	renderCell?: (row: any, field: any, api: EnchancedTableApi) => React.ReactNode;
	renderEditor?: (row: any, onCancel: () => void, onSave: (value: string) => void) => React.ReactNode;

	editMaxLength?: number;
	editMultiline?: boolean;
}