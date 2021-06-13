import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React, { useCallback, useState } from "react";
import {Accordion, AccordionDetails, AccordionSummary, FormControl, InputLabel, MenuItem, Select} from "@material-ui/core/";
import {assert} from "../../common/Assert";
import {ExpandMore} from "@material-ui/icons";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {Level} from "../../data/Level";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import { PlayerUtils } from "../../common/PlayerUtils";
import { Player } from "../../data/Player";

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

interface LevelsTabProps {

}

interface LevelsTabState {
	hold: Hold;
	allRows: LevelRow[];
	players: Player[];
	columns: EnchancedTableColumn[];
}

export class LevelsTab extends React.Component<LevelsTabProps, LevelsTabState> {
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
				{id: 'index', label: 'Index', width: "5%", padding: "none"},
				{id: 'isTextEdited', label: 'Δ', width: "5%", renderCell: this.renderIsTextEditedCell, padding: "none"},
				{id: 'text', label: 'Name', editable: true, editMaxLength: 255},
				{id: 'isAuthorEdited', label: 'Δ', width: "5%", renderCell: this.renderIsAuthorEditedCell, padding: "none"},
				{id: 'authorId', label: 'Author', editable: true, renderEditor: this.renderAuthorEditor},
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
	}

	private handleResetAuthorRow = (id: number) => {
		const {hold} = this.state;
		const level = hold.levels.get(id);
		assert(level, `Failed to find level with ID '${id}'`);
		delete (level.changes.name);

		ChangeUtils.levelPlayer(level, hold);

		const dataRow = this.getRowById(id);
		dataRow.authorId = dataRow.originalAuthorId;
		dataRow.authorName = dataRow.originalAuthorName;
		dataRow.isTextEdited = false;

		this._tableApi.current?.rerenderRow(id);
	}

	private handleTextEdited = (row: any, field: string, newValue: string) => {
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

		row.authorId = playerId;
		row.authorName = player.name
		row.isAuthorEdited = level.changes.playerId !== undefined;
	};

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
			isAuthorEdited: playerId !== originalPlayerId
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
		const {allRows, columns} = this.state;

		return <Accordion>
			<AccordionSummary
				expandIcon={<ExpandMore/>}
			>Levels</AccordionSummary>
			<AccordionDetails>
				<EnchancedTable
					columns={columns}
					rows={allRows}
					idField="id"
					rowsPerPage={RowsPerPage}
					onEditedCell={this.handleTextEdited}
					apiRef={this._tableApi}
				/>
			</AccordionDetails>
		</Accordion>;
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
		if (row.isTextEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetAuthorRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};

	private renderAuthorEditor = (row: LevelRow, onCancel: () => void, onSave: (value: string) => void) => {
		const {players} = this.state;
		const ID = `level-author-${row.id}`;

		return <AuthorEditor
			onCancel={onCancel}
			onSave={value => this.handleAuthorEdited(row, value)}
			defaultValue={row.authorId.toString()}
			players={players}/>
	}
}


interface AuthorEditorProps {
	onCancel: () => void;
	onSave: (newValue: string) => void;
	defaultValue: string;
	players: Player[]
}

const AuthorEditor = (props: AuthorEditorProps) => {
	const {onCancel, onSave, defaultValue, players} = props;

	const [value, setValue] = useState(defaultValue);
	const onChange = useCallback((event: React.ChangeEvent<{value: unknown}>) => {
		setValue(event.target.value as string);
	}, [setValue]);

	const onKeyDown = useCallback((event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
				onSave(value);

		} else if (event.key === 'Escape') {
			onCancel();
		}
	}, [onCancel, onSave, value]);

	return <FormControl variant="filled">
		<InputLabel id="level-author-editor">
		Enter to save, Escape/Click away to cancel
		</InputLabel>
		<Select
			labelId="level-author-editor"
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			>
		{players.map(player => <MenuItem value={player.id.toString()}>
			{PlayerUtils.getName(player)}
		</MenuItem>)}
		</Select>
	</FormControl>;
};