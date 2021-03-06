import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Box, Button, Container, Paper, Switch, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {Player} from "../../data/Player";
import {EnchancedTableApi, EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {HoldUtils} from "../../common/HoldUtils";
import {ModelType} from "../../common/Enums";
import {UpdateUtils} from "../../common/UpdateUtils";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
	table: {
		marginBottom: theme.spacing(1),
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

		const hold = Store.loadedHold.value;
		const allRows = this.getRows(hold);
		this.state = {
			hold,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none", renderCell: this.renderIdCell},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Text', editable: true, editMaxLength: 1024, cellClassName: 'tommable'},
				{id: 'levelCount', label: 'Used in Levels', width: '10%'},
				{id: 'isDeleted', label: 'Delete', width: "90px", sortable: false, padding: "none", renderCell: this.renderDeleteRow},
			],
		};
	}

	private handleResetRow = (id: number) => {
		const {hold} = this.state;
		const player = HoldUtils.getPlayer(id, hold);

		UpdateUtils.playerName(player, player.name, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleDeleteRowClicked = (id: number) => {
		const {hold} = this.state;

		const row = this.getRowById(id);
		const player = HoldUtils.getPlayer(id, hold);

		if (player.isNew) {
			// remove from changes
			player.isNew = false;
			ChangeUtils.playerCreated(player, hold);

			// Remove from Hold
			hold.players.delete(id);

			// Remove from table
			const allRows = this.state.allRows.concat();
			allRows.splice(allRows.indexOf(row), 1);
			this.setState({allRows});
			return;
		}

		UpdateUtils.playerDeleted(player, !player.isDeleted, hold);

		row.isDeleted = player.isDeleted;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleCellEdited = (row: PlayerRow, field: string, newValue: string) => {
		const {hold} = this.state;
		const player = HoldUtils.getPlayer(row.id, hold);

		UpdateUtils.playerName(player, newValue, hold);

		this.getRowById(row.id).isEdited = player.changes.name !== undefined;
	};

	private handleAddPlayer = () => {
		const {hold, allRows} = this.state;
		const newId = HoldUtils.getNextPlayerId(hold);
		const player: Player = {
			modelType: ModelType.Player,
			xml: hold.xmlDocument.createElement('Players'),
			id: newId,
			name: `Player #${newId}`,
			isNew: true,
			isDeleted: false,
			changes: {},
		};

		hold.players.set(newId, player);
		ChangeUtils.playerCreated(player, hold);

		const row = this.playerToRow(player, hold);
		this.setState({allRows: allRows.concat([row])});
	};

	private playerToRow(player: Player, hold: Hold): PlayerRow {
		const levelCount = Array.from(hold.levels.values())
			.filter(level => player.id === (level.changes.playerId ?? level.playerId))
			.length;

		return {
			id: player.id,
			text: player.changes.name ?? player.name,
			originalText: player.name,
			isNew: player.isNew,
			levelCount,
			isEdited: player.changes.name !== undefined,
			isDeleted: player.isDeleted,
			isDeletable: levelCount === 0 && hold.playerId !== player.id,
		};
	}

	private getRows = (hold: Hold) => {
		return Array.from(hold.players.values())
			.map(player => this.playerToRow(player, hold));
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
					This table contains all the players in the hold. Players are used for displaying
					author for each level. You can only delete players who are not assigned to any levels.
					You can create new players as needed, and authors can be reassigned in the
					&#32;<strong>Level</strong>&#32;tab.
				</Typography>
				<EnchancedTable
					className={classes.table}
					columns={columns}
					rows={allRows}
					idField="id"
					rowsPerPage={RowsPerPage}
					onEditedCell={this.handleCellEdited}
					apiRef={this._tableApi}
				/>
				<Box display="flex" justifyContent="flex-end">
					<Button variant="contained" color="primary" onClick={this.handleAddPlayer}>
						Add new player
					</Button>
				</Box>
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

		if (row.isNew) {
			return <Button
				variant="contained"
				color="secondary"
				onClick={onClick}
				disabled={!row.isDeletable}
			>
				Delete
			</Button>;
		}
		return row.isDeletable
			? <Switch checked={row.isDeleted} onChange={onClick}/>
			: <span/>;
	};

	private renderIdCell = (row: PlayerRow) => {
		return row.id;
	};
}

export default withStyles(styles)(PlayersTab);