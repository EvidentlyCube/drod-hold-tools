import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, Paper, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {RoomUtils} from "../../common/RoomUtils";
import {Entrance} from "../../data/Entrance";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {HoldUtils} from "../../common/HoldUtils";
import {UpdateUtils} from "../../common/UpdateUtils";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
		'& .cell-text': {
			whiteSpace: 'pre-wrap',
		},
	},
});

const RowsPerPage = 25;

interface EntranceRow {
	id: number;
	text: string;
	originalText: string;
	level: string;
	room: string;
	hasData: boolean;
	isEdited: boolean;
}

interface EntrancesTabProps extends WithStyles<typeof styles> {

}

interface EntrancesTabState {
	hold: Hold;
	allRows: EntranceRow[];
	columns: EnchancedTableColumn[];
}

class EntrancesTab extends React.Component<EntrancesTabProps, EntrancesTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<EntrancesTabProps> | EntrancesTabProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none"},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Text', editable: true, editMultiline: true, editMaxLength: 1350, cellClassName: 'tommable'},
				{id: 'level', label: 'Level', width: "15%"},
				{id: 'room', label: 'Room', width: "15%"},
			],
		};
	}

	private handleResetRow = (id: number) => {
		const {hold} = this.state;

		const entrance = HoldUtils.getEntrance(id, hold);
		UpdateUtils.entranceDescription(entrance, entrance.description, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleCellEdited = (row: EntranceRow, field: string, newValue: string) => {
		const {hold} = this.state;
		const entrance = HoldUtils.getEntrance(row.id, hold);

		UpdateUtils.entranceDescription(entrance, newValue, hold);

		this.getRowById(row.id).isEdited = entrance.changes.description !== undefined;
	};

	private static entranceToRow(entrance: Entrance, hold: Hold): EntranceRow {
		const room = HoldUtils.getRoom(entrance.roomId, hold);
		const level = HoldUtils.getLevel(room.levelId, hold);

		return {
			id: entrance.id,
			text: entrance.changes.description ?? entrance.description,
			originalText: entrance.description,
			level: level.name,
			room: RoomUtils.getCoordinateName(room.roomX, room.roomY),
			hasData: false,
			isEdited: entrance.changes.description !== undefined,
		};
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(Store.loadedHold.value.entrances.values()).map(entrance => EntrancesTab.entranceToRow(entrance, hold));
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
					Entrances
				</Typography>
				<Typography variant="body1" gutterBottom>
					This table contains all the entrances and their descriptions. Click on a description to edit it and ctrl+enter to save it.
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

	private renderIsEditedCell = (row: EntranceRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};
}

export default withStyles(styles)(EntrancesTab);