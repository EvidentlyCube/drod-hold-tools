import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Box, Container, createStyles, IconButton, Paper, Theme, Typography, withStyles, WithStyles} from "@material-ui/core/";
import {assert} from "../../common/Assert";
import {History} from "@material-ui/icons";
import {LightTooltip} from "../../common/components/LightTooltip";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {RoomUtils} from "../../common/RoomUtils";
import {Scroll} from "../../data/Scroll";

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
	id: number;
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
				{id: 'text', label: 'Text', editable: true, editMultiline: true},
				{id: 'level', label: 'Level', width: "15%"},
				{id: 'room', label: 'Room', width: "15%"},
			],
		};
	}

	private handleResetRow(event: React.MouseEvent, id: number) {
		event.preventDefault();
		event.stopPropagation();

		const {hold} = this.state;
		const scroll = hold.scrolls.get(id);
		assert(scroll, `Failed to find scroll with ID '${id}'`);
		delete (scroll.changes.text);

		ChangeUtils.scrollText(scroll, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	}

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold} = this.state;
		const scroll = hold.scrolls.get(row.id as number);
		assert(scroll, `No scroll found for id '${row.id}'`);

		scroll.changes.text = newValue;
		if (scroll.text === scroll.changes.text) {
			delete (scroll.changes.text);
		}

		ChangeUtils.scrollText(scroll, hold);

		this.getRowById(row.id).isEdited = scroll.changes.text !== undefined;
	};

	private static scrollToRow(scroll: Scroll, hold: Hold): ScrollRow {
		const room = hold.rooms.get(scroll.roomId);
		assert(room, `Failed to find room with ID '${scroll.roomId}'`);
		const level = hold.levels.get(room.levelId);
		assert(level, `Failed to find level with ID '${room.levelId}'`);

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
			return <LightTooltip title={<React.Fragment>
				<Typography variant="body2" gutterBottom><Box textAlign="center" fontWeight="fontWeightBold">Click to undo changes</Box></Typography>
				<Typography variant="body2">
					<Box fontSize={12} fontWeight="fontWeightMedium" display="inline">Original text:</Box>&nbsp;
					<Box fontSize={12} fontWeight="fontWeightLight" display="inline">{row.originalText}</Box>
				</Typography>
			</React.Fragment>}>
				<IconButton onClick={e => this.handleResetRow(e, row.id)}>
					<History color="primary"/>
				</IconButton>
			</LightTooltip>;
		}

		return <span/>;
	};
}

export default withStyles(styles)(ScrollsTab);