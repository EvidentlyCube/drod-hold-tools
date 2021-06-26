import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, IconButton, Paper, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {EnchancedTableApi, EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable} from "../../common/components/EnchancedTable";
import {Data, DataFormat} from "../../data/Data";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {HoldUtils} from "../../common/HoldUtils";
import {UpdateUtils} from "../../common/UpdateUtils";
import {DataUtils} from "../../common/DataUtils";
import {Edit} from "@material-ui/icons";
import {DataPreviewDialog} from "./DataPreviewDialog";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
		'& .cell-name': {
			whiteSpace: 'pre-wrap',
		},
	},
});

const RowsPerPage = 25;

interface DataRow {
	id: number;
	name: string;
	originalName: string;
	type: string;
	format: DataFormat;
	size: number;
	isNameEdited: boolean;
	isDataEdited: boolean;
	data: Data;
}

interface DatasTabProps extends WithStyles<typeof styles> {
}

interface DatasTabState {
	hold: Hold;
	allRows: DataRow[];
	columns: EnchancedTableColumn[];
	previewData?: Data;
	replaceData?: Data;
}

class DatasTab extends React.Component<DatasTabProps, DatasTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<DatasTabProps> | DatasTabProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			previewData: undefined,
			replaceData: undefined,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none"},
				{id: 'isNameEdited', label: 'Δ', width: "5%", renderCell: this.renderIsEditedCell, padding: "none", headerTitle: "Is name changed?"},
				{id: 'name', label: 'Name', editable: true, editMaxLength: 1350},
				{id: 'isDataEdited', label: 'Δ', width: "5%", renderCell: this.renderIsEditedCell, padding: "none", headerTitle: "Is data changed?"},
				{id: 'edit', label: 'View', width: '5%', renderCell: this.renderEditCell, padding: "none", sortable: false},
				{id: 'type', label: 'Type', width: '15%'},
				{id: 'size', label: 'Size', width: '8%', renderCell: row => DataUtils.formatSize(row.size), type: 'numeric'},
			],
		};
	}

	private handleResetName = (id: number) => {
		const {hold} = this.state;
		const data = HoldUtils.getData(id, hold);

		UpdateUtils.dataName(data, data.name, hold);

		const dataRow = this.getRowById(id);
		dataRow.name = dataRow.originalName;
		dataRow.isNameEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleResetData = (id: number) => {
		const {hold} = this.state;
		const data = HoldUtils.getData(id, hold);

		UpdateUtils.dataData(data, data.data, hold);

		const dataRow = this.getRowById(id);
		dataRow.isDataEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleCellEdited = (row: DataRow, field: string, newValue: string) => {
		const {hold} = this.state;
		const data = HoldUtils.getData(row.id, hold);

		UpdateUtils.dataName(data, newValue, hold);

		this.getRowById(row.id).isNameEdited = data.changes.name !== undefined;
	};

	private static dataToRow(data: Data): DataRow {
		return {
			id: data.id,
			name: data.changes.name ?? data.name,
			originalName: data.name,
			type: DataUtils.dataFormatToText(data.format),
			format: data.format,
			size: data.size,
			isNameEdited: data.changes.name !== undefined,
			isDataEdited: data.changes.data !== undefined,
			data,
		};
	}

	private getRows = () => {
		return Array.from(Store.loadedHold.value.datas.values()).map(data => DatasTab.dataToRow(data));
	};

	private getRowById = (id: number) => {
		for (const checkedRow of this.state.allRows) {
			if (checkedRow.id === id) {
				return checkedRow;
			}
		}

		throw new Error(`Failed to find row with ID '${id}'`);
	};

	private handleClosePreviewDialog = () => {
		this.setState({previewData: undefined});
	};

	private handlePreviewDialogDataChange = (data: Data) => {
		const row = this.getRowById(data.id);
		row.isDataEdited = data.changes.data !== undefined;
		
		this._tableApi.current?.rerender();
	};

	public render() {
		const {classes} = this.props;
		const {allRows, columns, previewData, hold} = this.state;

		return <Container maxWidth="xl">
			<Paper className={classes.content}>
				<Typography variant="h5" gutterBottom>
					Datas
				</Typography>
				<Typography variant="body1" gutterBottom>
					This table contains all the datas and their name. Click on the name to edit it, press ctrl+enter to save changes.
				</Typography>
				<EnchancedTable
					columns={columns}
					rows={allRows}
					idField="id"
					rowsPerPage={RowsPerPage}
					onEditedCell={this.handleCellEdited}
					apiRef={this._tableApi}
				/>
			</Paper>
			<DataPreviewDialog
				hold={hold}
				onClose={this.handleClosePreviewDialog}
				onDataChange={this.handlePreviewDialogDataChange}
				data={previewData}/>
		</Container>;
	}

	private renderIsEditedCell = (row: DataRow, field: string) => {
		if (field === 'isNameEdited' && row.isNameEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetName}
				originalText={row.originalName}/>;
		} else if (field === 'isDataEdited' && row.isDataEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetData}
				label="Click to reset data"/>;
			
		}

		return <span/>;
	};

	private renderEditCell = (row: DataRow) => {
		return <IconButton onClick={() => this.setState({previewData: row.data})}>
			<Edit/>
		</IconButton>;
	};
}

export default withStyles(styles)(DatasTab);