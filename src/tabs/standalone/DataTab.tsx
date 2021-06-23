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
import {Visibility} from "@material-ui/icons";
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
	isEdited: boolean;
	data: Data;
}

interface DatasTabProps extends WithStyles<typeof styles> {
}

interface DatasTabState {
	hold: Hold;
	allRows: DataRow[];
	columns: EnchancedTableColumn[];
	previewData?: Data;
}

class DatasTab extends React.Component<DatasTabProps, DatasTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<DatasTabProps> | DatasTabProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			previewData: undefined,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none"},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'name', label: 'Name', editable: true, editMultiline: true, editMaxLength: 1350},
				{id: 'preview', label: 'Preview', width: '5%', renderCell: this.renderPreviewCell, padding: "none"},
				{id: 'type', label: 'Type', width: '15%'},
				{id: 'size', label: 'Size', width: '8%', renderCell: row => DataUtils.formatSize(row.size), type: 'numeric'},
			],
		};
	}

	private handleResetRow = (id: number) => {
		const {hold} = this.state;
		const data = HoldUtils.getData(id, hold);

		UpdateUtils.dataName(data, data.name, hold);

		const dataRow = this.getRowById(id);
		dataRow.name = dataRow.originalName;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleCellEdited = (row: DataRow, field: string, newValue: string) => {
		const {hold} = this.state;
		const data = HoldUtils.getData(row.id, hold);

		UpdateUtils.dataName(data, newValue, hold);

		this.getRowById(row.id).isEdited = data.changes.name !== undefined;
	};

	private static dataToRow(data: Data): DataRow {
		return {
			id: data.id,
			name: data.changes.name ?? data.name,
			originalName: data.name,
			type: DataUtils.dataFormatToText(data.format),
			format: data.format,
			size: data.size,
			isEdited: data.changes.name !== undefined,
			data
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
	}

	public render() {
		const {classes} = this.props;
		const {allRows, columns, previewData} = this.state;

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
			<DataPreviewDialog name={previewData ? previewData.changes.name ?? previewData.name : ''} onClose={this.handleClosePreviewDialog} data={previewData} />
		</Container>;
	}

	private renderIsEditedCell = (row: DataRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalName}/>;
		}

		return <span/>;
	};

	private renderPreviewCell = (row: DataRow) => {
		if (row.format === DataFormat.BMP || row.format === DataFormat.JPG || row.format === DataFormat.PNG) {
			return <IconButton onClick={() => this.setState({previewData: row.data })}>
				<Visibility/>
			</IconButton>
		}
	}
}

export default withStyles(styles)(DatasTab);