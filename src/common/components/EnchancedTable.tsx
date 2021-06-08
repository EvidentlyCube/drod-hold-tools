import React, {useCallback, useState} from "react";
import {EnchancedTableColumn} from "./EnchancedTableCommons";
import {SortUtils} from "../SortUtils";
import {
	createStyles,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableFooter,
	TablePagination,
	TableRow,
	TextField,
	Theme,
	WithStyles,
	withStyles,
} from "@material-ui/core";
import {EnchancedTableHead} from "./EnchancedTableHead";
import {Create} from "@material-ui/icons";

const DefaultRowsPerPage = 25;

const styles = (theme: Theme) => createStyles({
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
			right: theme.spacing(1),
		},
	},
});

export interface EnchancedTableApi {
	rerenderRow(id: any): void;
}

interface EnchancedTableProps extends WithStyles<typeof styles> {
	columns: EnchancedTableColumn[];
	rows: any[];

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
	private _editedCellRef = React.createRef<HTMLElement>();

	constructor(props: Readonly<EnchancedTableProps> | EnchancedTableProps) {
		super(props);

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
	}

	private onDocumentClick = (event: MouseEvent) => {
		let node = event.target as HTMLElement | null;
		while (node) {
			if (node === this._editedCellRef.current) {
				return;
			}

			node = node.parentElement;
		}

		this.onCancelEdit();
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

	private getSortedRows(orderBy: string, orderDir: 'asc' | 'desc') {
		const {rows, idField} = this.props;

		return SortUtils.stableSort<any>(rows, idField, SortUtils.getComparator<any>(orderDir, orderBy));
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
		const {columns, rowsPerPage, rows, classes} = this.props;
		const {orderBy, orderDir, visibleRows, page} = this.state;

		return <TableContainer>
			<Table className={classes.table}>
				<colgroup>
					{columns.map(col => this.renderColumnWidth(col))}
				</colgroup>
				<EnchancedTableHead orderBy={orderBy} orderDir={orderDir} onSort={this.onSort} columns={columns}/>
				<TableBody>
					{visibleRows.map(row => this.renderRow(row))}
				</TableBody>
				<TableFooter>
					<TableRow>
						<TablePagination
							count={rows.length}
							page={page}
							rowsPerPage={rowsPerPage ?? DefaultRowsPerPage}
							rowsPerPageOptions={[]}
							onChangePage={this.onChangePage}
						/>
					</TableRow>
				</TableFooter>
			</Table>
		</TableContainer>;
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
			className={column.editable ? 'editable' : ''}
			padding={column.padding ?? "default"}
		>
			{column.renderCell
				? column.renderCell(row)
				: row[column.id] || <span>&nbsp;</span>}
			{column.editable && <Create className='edit-icon' fontSize="small"/>}
		</TableCell>;
	}

	private renderEditedCell(column: EnchancedTableColumn, row: any, key: string) {
		return <TableCell key={key} ref={this._editedCellRef}>
			<DefaultEditor
				onCancel={this.onCancelEdit}
				onSave={this.onSaveEdit}
				defaultValue={row[column.id].toString()}
				maxLength={column.editMaxLength}/>
		</TableCell>;
	}
}

interface DefaultEditorProps {
	onCancel: () => void;
	onSave: (newValue: string) => void;
	defaultValue: string;
	maxLength?: number;
}

const DefaultEditor = (props: DefaultEditorProps) => {
	const {onCancel, onSave, defaultValue, maxLength} = props;

	const [value, setValue] = useState(defaultValue);
	const onChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
	}, [setValue]);

	const onKeyDown = useCallback((event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			onSave(value);

		} else if (event.key === 'Escape') {
			onCancel();
		}
	}, [onCancel, onSave, value]);

	return <TextField
		autoFocus
		value={value}
		variant="outlined"
		style={{width: "100%"}}
		label="Enter to save, Escape/Click away to cancel"
		onChange={onChange}
		inputProps={{maxLength: maxLength}}
		onKeyDown={onKeyDown}/>;
};

export const EnchancedTable = withStyles(styles)(_EnchancedTable);