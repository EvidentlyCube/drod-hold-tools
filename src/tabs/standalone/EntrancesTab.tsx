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
import {Entrance} from "../../data/Entrance";

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
		const entrance = hold.entrances.get(id);
		assert(entrance, `Failed to find entrance with ID '${id}'`);
		delete (entrance.changes.description);

		ChangeUtils.entranceDescription(entrance, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	}

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold} = this.state;
		const entrance = hold.entrances.get(row.id as number);
		assert(entrance, `No entrance found for id '${row.id}'`);

		entrance.changes.description = newValue;
		if (entrance.description === entrance.changes.description) {
			delete (entrance.changes.description);
		}

		ChangeUtils.entranceDescription(entrance, hold);

		this.getRowById(row.id).isEdited = entrance.changes.description !== undefined;
	};

	private static entranceToRow(entrance: Entrance, hold: Hold): EntranceRow {
		const room = hold.rooms.get(entrance.roomId);
		assert(room, `Failed to find room with ID '${entrance.roomId}'`);
		const level = hold.levels.get(room.levelId);
		assert(level, `Failed to find level with ID '${room.levelId}'`);

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
					Commands text
				</Typography>
				<Typography variant="body1" gutterBottom>
					This table contains all the texts from all the commands in every character (custom character's default script & placed character). Click on the text to edit it, press enter to save changes.
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

export default withStyles(styles)(EntrancesTab);