import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, Paper, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {EnchancedTableApi, EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable} from "../../common/components/EnchancedTable";
import {Data} from "../../data/Data";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {HoldUtils} from "../../common/HoldUtils";
import {UpdateUtils} from "../../common/UpdateUtils";
import {DataUtils} from "../../common/DataUtils";

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
	size: number;
	isEdited: boolean;
}

interface DatasTabProps extends WithStyles<typeof styles> {

}

interface DatasTabState {
	hold: Hold;
	allRows: DataRow[];
	columns: EnchancedTableColumn[];
}

class DatasTab extends React.Component<DatasTabProps, DatasTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<DatasTabProps> | DatasTabProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none"},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'name', label: 'Name', editable: true, editMultiline: true, editMaxLength: 1350},
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

	private static dataToRow(data: Data, hold: Hold): DataRow {
		return {
			id: data.id,
			name: data.changes.name ?? data.name,
			originalName: data.name,
			type: DataUtils.dataFormatToText(data.format),
			size: data.size,
			isEdited: data.changes.name !== undefined,
		};
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(Store.loadedHold.value.datas.values()).map(data => DatasTab.dataToRow(data, hold));
	};

	private getRowById = (id: number) => {
		for (const checkedRow of this.state.allRows) {
			if (checkedRow.id === id) {
				return checkedRow;
			}
		}

		throw new Error(`Failed to find row with ID '${id}'`);
	};

	public render() {
		const {classes} = this.props;
		const {allRows, columns} = this.state;

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
}

export default withStyles(styles)(DatasTab);