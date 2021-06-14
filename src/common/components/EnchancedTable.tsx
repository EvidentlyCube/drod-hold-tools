import React, {useCallback, useState} from "react";
import {EnchancedTableColumn} from "./EnchancedTableCommons";
import {SortUtils} from "../SortUtils";
import {Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, TextField} from "@material-ui/core";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {EnchancedTableHead} from "./EnchancedTableHead";
import {Create} from "@material-ui/icons";
import {assert} from "../Assert";

const DefaultRowsPerPage = 25;

const styles = () => createStyles({
	table: {
		'& .editable': {
			cursor: 'pointer',
			position: 'relative',
		},
		'& .editable:hover': {
			background: '#F8F8F8',
		},
		'& .editable:not(:hover) .edit-icon': {
			display: 'none',
		},
		'& .edit-icon': {
			position: 'absolute',
			top: 'calc(50% - 10px)',
			right: '16px',
		},
	},
});

export interface EnchancedTableApi {
	rerender(): void;

	rerenderRow(id: any): void;

	setDelayedClickAway(enabled: boolean): void;
	suppressClickAwayForFrame(): void;
	disableClickAwayClose(): void;
}

interface EnchancedTableProps extends WithStyles<typeof styles> {
	columns: EnchancedTableColumn[];
	rows: any[];
	pagination?: boolean;

	className?: string;

	idField: string;
	rowsPerPage?: number;

	apiRef?: React.RefObject<EnchancedTableApi>;
	onEditedCell?: (row: any, field: string, newValue: string) => void;
}

interface EnchancedTableState {
	sortedRows: any[];
	visibleRows: any[];
	orderBy: string;
	orderDir: 'asc' | 'desc';
	page: number;
	editedColumn?: string;
	editedRowId?: any;
}

class _EnchancedTable extends React.Component<EnchancedTableProps, EnchancedTableState> implements EnchancedTableApi {
	private _suppressClickAway = false;
	private _delayedClickAway = false;
	private _editedCellRef = React.createRef<HTMLElement>();

	constructor(props: Readonly<EnchancedTableProps> | EnchancedTableProps) {
		super(props);

		if (!props.columns.find(col => col.id === props.idField)) {
			throw new Error(`ID field is set to '${props.idField}' but this column does not exist.`);
		}

		const rowsPerPage = this.props.rowsPerPage ?? DefaultRowsPerPage;
		const sortedRows = this.getSortedRows(props.idField, 'asc');

		this.state = {
			sortedRows: sortedRows,
			visibleRows: sortedRows.slice(0, rowsPerPage),
			orderBy: props.idField,
			orderDir: 'asc',
			page: 0,
		};

		if (this.props.apiRef) {
			(this.props.apiRef as any).current = this;
		}
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.onDocumentClick);
	}

	componentDidUpdate(prevProps: Readonly<EnchancedTableProps>, prevState: Readonly<EnchancedTableState>, snapshot?: any) {
		if (prevProps.apiRef) {
			(prevProps.apiRef as any).current = null;
		}
		if (this.props.apiRef) {
			(this.props.apiRef as any).current = this;
		}

		if (prevProps.rows !== this.props.rows) {
			const {orderBy, orderDir, page} = this.state;
			const rowsPerPage = this.props.rowsPerPage ?? DefaultRowsPerPage;
			const sortedRows = this.getSortedRows(orderBy, orderDir);
			const visibleRows = sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

			if (visibleRows.length === 0) {
				this.setState({
					page: 0,
					sortedRows,
					visibleRows: sortedRows.slice(0, rowsPerPage),
				});
			} else {
				this.setState({
					sortedRows,
					visibleRows: visibleRows,
				});
			}
		}
	}

	private onDocumentClick = (event: MouseEvent) => {
		if (this._suppressClickAway) {
			return;

		} else if (this._delayedClickAway) {
			requestAnimationFrame(() => this.handleDocumentClick(event));

		} else {
			this.handleDocumentClick(event);
		}
	};

	private handleDocumentClick = (event: MouseEvent) => {
		if (this._suppressClickAway) {
			return;
		}

		let node = event.target as HTMLElement | null;

		while (node) {
			if (node === this._editedCellRef.current) {
				return;
			}

			node = node.parentElement;
		}

		this.onCancelEdit();
	};

	public rerender = () => {
		const {visibleRows} = this.state;
		this.setState({visibleRows: visibleRows.concat()});
	};

	public rerenderRow = (id: any) => {
		const {idField} = this.props;
		const {visibleRows} = this.state;

		for (const row of visibleRows) {
			if (row[idField] === id) {
				this.setState({visibleRows: visibleRows.concat()});
				break;
			}
		}
	};

	public suppressClickAwayForFrame() {
		this._suppressClickAway = true;

		requestAnimationFrame(() => this._suppressClickAway = false);
	}

	public disableClickAwayClose() {
		document.removeEventListener('click', this.onDocumentClick, {capture: true});
	}

	public setDelayedClickAway(enabled: boolean) {
		this._delayedClickAway = enabled;
	}

	private getSortedRows(orderBy: string, orderDir: 'asc' | 'desc') {
		const {rows, columns, idField} = this.props;

		const column = columns.find(col => col.id === orderBy);

		assert(column, `No column with id '${orderBy}' found`);

		return SortUtils.stableSort<any>(rows, idField, SortUtils.getComparator<any>(orderDir, orderBy, column.type));
	}

	private onSort = (newOrderBy: string) => {
		const {rowsPerPage} = this.props;
		const {orderBy, orderDir} = this.state;
		const newOrderDir = orderBy === newOrderBy && orderDir === "asc" ? 'desc' : 'asc';

		const sortedRows = this.getSortedRows(newOrderBy, newOrderDir);

		this.setState({
			orderDir: newOrderDir,
			orderBy: newOrderBy,
			page: 0,
			visibleRows: sortedRows.slice(0, rowsPerPage ?? DefaultRowsPerPage),
			sortedRows,
		});
	};

	private onChangePage = (_: any, newPage: number) => {
		const rowsPerPage = this.props.rowsPerPage ?? DefaultRowsPerPage;
		const {sortedRows} = this.state;

		this.setState({
			page: newPage,
			visibleRows: sortedRows.slice(newPage * rowsPerPage, (newPage + 1) * rowsPerPage),
		});
	};

	private onEdit = (row: any, column: string) => {
		const {idField} = this.props;

		this.setState({
			editedColumn: column,
			editedRowId: row[idField],
		});

		document.addEventListener('click', this.onDocumentClick, {capture: true});
	};

	private onCancelEdit = () => {
		this.setState({
			editedColumn: undefined,
			editedRowId: undefined,
		});

		document.removeEventListener('click', this.onDocumentClick, {capture: true});
	};

	private onSaveEdit = (newValue: string) => {
		const {onEditedCell, idField} = this.props;
		const {visibleRows, editedColumn, editedRowId} = this.state;

		const row = visibleRows.find(row => row[idField] === editedRowId);

		if (row && editedColumn) {
			row[editedColumn] = newValue;
			onEditedCell?.(row, editedColumn, newValue);
		}

		this.setState({
			editedColumn: undefined,
			editedRowId: undefined,
		});

		document.removeEventListener('click', this.onDocumentClick, {capture: true});
	};

	public render() {
		const {columns, classes, className} = this.props;
		const {orderBy, orderDir, visibleRows} = this.state;

		return <TableContainer className={className}>
			<Table className={classes.table}>
				<colgroup>
					{columns.map(col => this.renderColumnWidth(col))}
				</colgroup>
				<EnchancedTableHead orderBy={orderBy} orderDir={orderDir} onSort={this.onSort} columns={columns}/>
				<TableBody>
					{visibleRows.map(row => this.renderRow(row))}
				</TableBody>
				{this.renderPagination()}
			</Table>
		</TableContainer>;
	}

	private renderPagination() {
		if (this.props.pagination === false) {
			return null;
		}

		const {rowsPerPage, rows} = this.props;
		const {page} = this.state;

		return <TableFooter>
			<TableRow>
				<TablePagination
					count={rows.length}
					page={page}
					rowsPerPage={rowsPerPage ?? DefaultRowsPerPage}
					rowsPerPageOptions={[]}
					onPageChange={this.onChangePage}
				/>
			</TableRow>
		</TableFooter>;
	}

	private renderColumnWidth(column: EnchancedTableColumn) {
		return column.width
			? <col key={column.id} style={{width: column.width}}/>
			: <col key={column.id}/>;
	}

	private renderRow(row: any) {
		const {idField, columns} = this.props;

		return <TableRow key={row[idField]}>
			{columns.map(col => this.renderCell(col, row))}
		</TableRow>;
	}

	private renderCell(column: EnchancedTableColumn, row: any) {
		const {idField} = this.props;
		const {editedColumn, editedRowId} = this.state;
		const align = column.type === 'numeric' ? 'right' : 'left';
		const isEdited = column.id === editedColumn && row[idField] === editedRowId;
		const key = `${column.id}::${row[idField]}`;

		if (isEdited) {
			return this.renderEditedCell(column, row, key);
		}

		const onClick = column.editable ? () => this.onEdit(row, column.id) : undefined;
		return <TableCell
			key={key}
			align={align}
			onClick={onClick}
			className={`cell-${column.id}` + (column.editable ? ' editable' : '')}
			padding={column.padding ?? "normal"}
		>
			{column.renderCell
				? column.renderCell(row)
				: row[column.id] || <span>&nbsp;</span>}
			{column.editable && <Create className="edit-icon" fontSize="small"/>}
		</TableCell>;
	}

	private renderEditedCell(column: EnchancedTableColumn, row: any, key: string) {
		return <TableCell key={key} ref={this._editedCellRef}>
			{column.renderEditor
				? column.renderEditor(row, this.onCancelEdit, this.onSaveEdit)
				: <DefaultEditor
					onCancel={this.onCancelEdit}
					onSave={this.onSaveEdit}
					defaultValue={row[column.id].toString()}
					maxLength={column.editMaxLength}
					multiline={column.editMultiline || false}/>
			}

		</TableCell>;
	}
}

interface DefaultEditorProps {
	onCancel: () => void;
	onSave: (newValue: string) => void;
	defaultValue: string;
	multiline: boolean;
	maxLength?: number;
}

const DefaultEditor = (props: DefaultEditorProps) => {
	const {onCancel, onSave, defaultValue, maxLength, multiline} = props;

	const [value, setValue] = useState(defaultValue);
	const onChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
	}, [setValue]);

	const onKeyDown = useCallback((event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			if (!multiline || event.ctrlKey) {
				onSave(value);
			}

		} else if (event.key === 'Escape') {
			onCancel();
		}
	}, [onCancel, onSave, value, multiline]);

	const label = multiline
		? "Ctrl+Enter to save, Escape/Click away to cancel"
		: "Enter to save, Escape/Click away to cancel";

	return <TextField
		autoFocus

		label={label}
		value={value}

		variant="outlined"
		style={{width: "100%"}}

		multiline={multiline}
		inputProps={{maxLength: maxLength}}

		onChange={onChange}
		onKeyDown={onKeyDown}/>;
};

export const EnchancedTable = withStyles(styles)(_EnchancedTable);