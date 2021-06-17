import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, Paper, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {RoomUtils} from "../../common/RoomUtils";
import {Scroll} from "../../data/Scroll";
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

interface ScrollRow {
	id: string;
	text: string;
	originalText: string;
	level: string;
	room: string;
	isEdited: boolean;
}

interface ScrollsTabProps extends WithStyles<typeof styles> {

}

interface ScrollsTabState {
	hold: Hold;
	allRows: ScrollRow[];
	columns: EnchancedTableColumn[];
}

class ScrollsTab extends React.Component<ScrollsTabProps, ScrollsTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<ScrollsTabProps> | ScrollsTabProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none"},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Text', editable: true, editMultiline: true, editMaxLength: 1350},
				{id: 'level', label: 'Level', width: "15%"},
				{id: 'room', label: 'Room', width: "15%"},
			],
		};
	}

	private handleResetRow = (id: string) => {
		const {hold} = this.state;
		const scroll = HoldUtils.getScroll(id, hold);

		UpdateUtils.scrollText(scroll, scroll.text, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleCellEdited = (row: ScrollRow, field: string, newValue: string) => {
		const {hold} = this.state;
		const scroll = HoldUtils.getScroll(row.id, hold);

		UpdateUtils.scrollText(scroll, newValue, hold);

		this.getRowById(row.id).isEdited = scroll.changes.text !== undefined;
	};

	private static scrollToRow(scroll: Scroll, hold: Hold): ScrollRow {
		const room = HoldUtils.getRoom(scroll.roomId, hold);
		const level = HoldUtils.getLevel(room.levelId, hold);

		return {
			id: scroll.id,
			text: scroll.changes.text ?? scroll.text,
			originalText: scroll.text,
			level: level.name,
			room: RoomUtils.getCoordinateName(room.roomX, room.roomY),
			isEdited: scroll.changes.text !== undefined,
		};
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(Store.loadedHold.value.scrolls.values()).map(scroll => ScrollsTab.scrollToRow(scroll, hold));
	};

	private getRowById = (id: string) => {
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
					Scrolls
				</Typography>
				<Typography variant="body1" gutterBottom>
					This table contains all the scrolls and their text. Click on the text to edit it, press ctrl+enter to save changes.
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

	private renderIsEditedCell = (row: ScrollRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};
}

export default withStyles(styles)(ScrollsTab);