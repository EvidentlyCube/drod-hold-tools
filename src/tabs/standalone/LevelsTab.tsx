import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React, {useCallback, useState} from "react";
import {Container, createStyles, FormControl, InputLabel, Paper, Select, Theme, Typography, withStyles, WithStyles} from "@material-ui/core/";
import {assert} from "../../common/Assert";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {Level} from "../../data/Level";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {PlayerUtils} from "../../common/PlayerUtils";
import {Player} from "../../data/Player";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});

const RowsPerPage = 25;

interface LevelRow {
	id: number;
	index: number;
	text: string;
	originalText: string;
	isTextEdited: boolean;
	authorId: number;
	originalAuthorId: number;
	authorName: string;
	originalAuthorName: string;
	isAuthorEdited: boolean;
}

interface LevelsTabProps extends WithStyles<typeof styles> {

}

interface LevelsTabState {
	hold: Hold;
	allRows: LevelRow[];
	players: Player[];
	columns: EnchancedTableColumn[];
}

class _LevelsTab extends React.Component<LevelsTabProps, LevelsTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<LevelsTabProps> | LevelsTabProps) {
		super(props);

		const hold = Store.loadedHold.value;
		const allRows = this.getRows(hold);
		this.state = {
			hold: hold,
			allRows: allRows,
			players: Array.from(hold.players.values()),
			columns: [
				{id: 'index', label: 'Index', type: 'numeric', width: "5%", padding: "none"},
				{id: 'isTextEdited', label: 'Δ', width: "5%", renderCell: this.renderIsTextEditedCell, padding: "none", headerTitle: "Is text changed?"},
				{id: 'text', label: 'Name', editable: true, editMaxLength: 255},
				{id: 'isAuthorEdited', label: 'Δ', width: "5%", renderCell: this.renderIsAuthorEditedCell, padding: "none", headerTitle: "Is author changed?"},
				{id: 'authorName', label: 'Author', editable: true, renderEditor: this.renderAuthorEditor, width: '30%'},
			],
		};
	}

	private handleResetTextRow = (id: number) => {
		const {hold} = this.state;
		const level = hold.levels.get(id);
		assert(level, `Failed to find level with ID '${id}'`);
		delete (level.changes.name);

		ChangeUtils.levelName(level, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isTextEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleResetAuthorRow = (id: number) => {
		const {hold} = this.state;
		const level = hold.levels.get(id);
		assert(level, `Failed to find level with ID '${id}'`);
		delete (level.changes.playerId);

		ChangeUtils.levelPlayer(level, hold);
		this.handleAuthorChanged(level);

		const dataRow = this.getRowById(id);
		dataRow.authorId = dataRow.originalAuthorId;
		dataRow.authorName = dataRow.originalAuthorName;
		dataRow.isAuthorEdited = false;

		this._tableApi.current?.rerenderRow(dataRow.index);
	};

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		if (field === 'text') {
			this.handleTextEdited(row, newValue);
		} else if (field === 'authorName') {
			this.handleAuthorEdited(row, newValue);
		}
	};

	private handleTextEdited = (row: any, newValue: string) => {
		const {hold} = this.state;
		const level = hold.levels.get(row.id as number);
		assert(level, `No level found for id '${row.id}'`);

		level.changes.name = newValue;
		if (level.name === level.changes.name) {
			delete (level.changes.name);
		}

		ChangeUtils.levelName(level, hold);

		this.getRowById(row.id).isTextEdited = level.changes.name !== undefined;
	};

	private handleAuthorEdited = (row: any, newValue: string) => {
		const playerId = parseInt(newValue);
		if (Number.isNaN(playerId)) {
			throw new Error(`Tried to set level author to non-numeric value '${newValue}'`);
		}

		const {hold} = this.state;
		const level = hold.levels.get(row.id as number);
		assert(level, `No level found for id '${row.id}'`);

		const player = hold.players.get(playerId);
		assert(player, `No player found for id '${playerId}'`);

		level.changes.playerId = playerId;
		if (level.playerId === level.changes.playerId) {
			delete level.changes.playerId;
		}

		ChangeUtils.levelPlayer(level, hold);
		this.handleAuthorChanged(level);

		row.authorId = playerId;
		row.authorName = PlayerUtils.getName(player);
		row.isAuthorEdited = level.changes.playerId !== undefined;
	};

	private handleAuthorChanged = (level: Level) => {
		const {hold} = this.state;
		const levelName = level.changes.name ?? level.name;
		const playerId = level.changes.playerId ?? level.playerId;
		const player = hold.players.get(playerId);
		assert(player, `Failed to find player with ID '${playerId}'`);

		if (player.isDeleted) {
			player.isDeleted = false;
			ChangeUtils.playerDeleted(player, hold);
			Store.addSystemMessage({
				message: <p>
					Player&nbsp;<strong>{PlayerUtils.getName(player)}</strong>&nbsp;is no longer marked
					for deletion, as it's now the author of level&nbsp;<strong>{levelName}</strong>. 
				</p>,
				color: "info"
			})
		}
	}

	private levelToRow(level: Level, hold: Hold): LevelRow {
		const playerId = level.changes.playerId ?? level.playerId;
		const originalPlayerId = level.playerId;
		const player = hold.players.get(playerId);
		const originalPlayer = hold.players.get(originalPlayerId);
		assert(player, `Failed to find player with ID '${playerId}'`);
		assert(originalPlayer, `Failed to find player with ID '${originalPlayerId}'`);

		return {
			id: level.id,
			index: level.index,
			text: level.changes.name ?? level.name,
			originalText: level.name,
			isTextEdited: level.changes.name !== undefined,
			authorId: playerId,
			originalAuthorId: originalPlayerId,
			authorName: PlayerUtils.getName(player),
			originalAuthorName: PlayerUtils.getName(originalPlayer),
			isAuthorEdited: playerId !== originalPlayerId,
		};
	}

	private getRows = (hold: Hold) => {
		return Array.from(hold.levels.values())
			.map(level => this.levelToRow(level, hold));
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
					Levels
				</Typography>
				<Typography variant="body1" gutterBottom>
					This table containst all the players in the hold. You can edit a level's
					name and change the author - which is the name displayed with entrance
					messages for given levels. Authors must use one of the Players that
					are defined in the hold - new players can be added in Players tab.
				</Typography>
				<EnchancedTable
					columns={columns}
					rows={allRows}
					idField="index"
					rowsPerPage={RowsPerPage}
					onEditedCell={this.handleCellEdited}
					apiRef={this._tableApi}
				/>
			</Paper>
		</Container>;
	}

	private renderIsTextEditedCell = (row: LevelRow) => {
		if (row.isTextEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetTextRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};

	private renderIsAuthorEditedCell = (row: LevelRow) => {
		if (row.isAuthorEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetAuthorRow}
				originalText={row.originalAuthorName}/>;
		}

		return <span/>;
	};

	private renderAuthorEditor = (row: LevelRow, onCancel: () => void, onSave: (value: string) => void) => {
		const {players} = this.state;

		return <AuthorEditor
			api={this._tableApi.current!}
			onCancel={onCancel}
			onSave={onSave}
			defaultValue={row.authorId.toString()}
			players={players}/>;
	};
}


interface AuthorEditorProps {
	api: EnchancedTableApi;
	onCancel: () => void;
	onSave: (newValue: string) => void;
	defaultValue: string;
	players: Player[]
}

const AuthorEditor = (props: AuthorEditorProps) => {
	const {api, onCancel, onSave, defaultValue, players} = props;

	const [value, setValue] = useState(defaultValue);
	const onChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
		setValue(event.target.value as string);
	}, [setValue]);

	const onKeyDown = useCallback((event: React.KeyboardEvent) => {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			event.stopPropagation();
			onSave(value);

		} else if (event.key === 'Escape') {
			onCancel();
		}
	}, [onCancel, onSave, value]);

	return <FormControl variant="filled" fullWidth={true}>
		<InputLabel id="level-author-editor">
			Ctrl+Enter to save, Escape/Click away to cancel
		</InputLabel>
		<Select
			autoFocus
			native
			labelId="level-author-editor"
			value={value}
			onOpen={() => api.suppressClickAwayForFrame()}
			onChange={onChange}
			onKeyDown={onKeyDown}
			inputProps={{
				name: 'age',
				id: 'level-author-editor',
			}}
		>
			{players.map(player => <option value={player.id.toString()} key={player.id}>
				{PlayerUtils.getName(player)}
			</option>)}
		</Select>
	</FormControl>;
};

export const LevelsTab = withStyles(styles)(_LevelsTab);