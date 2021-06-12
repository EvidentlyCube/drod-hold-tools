import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, createStyles, Paper, Switch, Theme, Typography, withStyles, WithStyles} from "@material-ui/core/";
import {Player} from "../../data/Player";
import {assert} from "../../common/Assert";
import {HoldUtils} from "../../common/HoldUtils";
import {SpeechUtils} from "../../common/SpeechUtils";
import {CommandsUtils} from "../../common/CommandsUtils";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {IsEditedCell} from "../../common/components/IsEditedCell";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});

const RowsPerPage = 25;

interface PlayerRow {
	id: number
	text: string
	originalText: string

	levelCount: number;

	isEdited: boolean;
	isNew: boolean;
	isDeleted: boolean;
	isDeletable: boolean;
}

interface PlayersTabProps extends WithStyles<typeof styles> {

}

interface PlayersTabState {
	hold: Hold;
	allRows: PlayerRow[];
	columns: EnchancedTableColumn[];
}

class PlayersTab extends React.Component<PlayersTabProps, PlayersTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<PlayersTabProps> | PlayersTabProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none", renderCell: this.renderIdCell},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Text', editable: true, editMaxLength: 1024},
				{id: 'levelCount', label: 'Used in Levels', width: '10%'},
				{id: 'isDeleted', label: 'Delete', width: "5%", sortable: false, padding: "none", renderCell: this.renderDeleteRow},
			],
		};
	}

	private handleResetRow = (id: number) => {
		const {hold} = this.state;
		const player = hold.players.get(id);
		assert(player, `Failed to find player with ID '${id}'`);
		delete (player.changes.name);

		ChangeUtils.playerName(player, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	}

	private handleDeleteRowClicked = (id: number) => {
		const {hold} = this.state;

		const player = hold.players.get(id);
		assert(player, `Marking for deletion player which does not exist #${id}`);

		player.isDeleted = !player.isDeleted;

		ChangeUtils.playerDeleted(player, hold);
		this.getRowById(id).isDeleted = player.isDeleted;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold} = this.state;
		const player = hold.players.get(row.id as number);
		assert(player, `No player found for id '${row.id}'`);

		player.changes.name = newValue;
		if (player.name === player.changes.name) {
			delete player.changes.name;
		}

		ChangeUtils.playerName(player, hold);

		this.getRowById(row.id).isEdited = player.changes.name !== undefined;
	};

	private static playerToRow(player: Player, hold: Hold): PlayerRow {
		const levelCount = Array.from(hold.levels.values())
			.filter(level => level.playerId === player.id)
			.length;																														
		
		return {
			id: player.id,
			text: player.changes.name ?? player.name,
			originalText: player.name,
			isNew: player.isNew,
			levelCount,
			isEdited: player.changes.name !== undefined,
			isDeleted: player.isDeleted,
			isDeletable: levelCount === 0 && hold.playerId !== player.id
		};
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(Store.loadedHold.value.players.values())
			.map(player => PlayersTab.playerToRow(player, hold));
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
					Players
				</Typography>
				<Typography variant="body1" gutterBottom>
					This table all the players in the hold. Players are used for displaying
					author for each level. You can only delete players who are not assigned to any levels.
					You can create new players as needed, and authors can be reassigned in the
					&#32;<strong>Level</strong>&#32;tab. 
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

	private renderIsEditedCell = (row: PlayerRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};

	private renderDeleteRow = (row: PlayerRow) => {
		const onClick = () => {
			this.handleDeleteRowClicked(row.id);
		};

		return row.isDeletable
			? <Switch checked={row.isDeleted} onChange={onClick}/>
			: <span/>;
	};

	private renderIdCell = (row: PlayerRow) => {
		return row.id;
	}
}

export default withStyles(styles)(PlayersTab);