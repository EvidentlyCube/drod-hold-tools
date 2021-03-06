import {Container, Dialog, DialogTitle, MenuItem, Paper, Select, TextField, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import React, {useCallback, useEffect, useState} from "react";
import {EnchancedTable} from "../../common/components/EnchancedTable";
import {EnchancedTableApi, EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {DateUtils} from "../../common/DateUtils";
import {useDocumentKeydown} from "../../common/Hooks";
import {PlayerUtils} from "../../common/PlayerUtils";
import {Hold} from "../../data/Hold";
import {Level} from "../../data/Level";
import {Player} from "../../data/Player";
import {Store} from "../../data/Store";
import {CalendarPicker} from "@material-ui/lab";
import {parseISO} from "date-fns";
import {HoldUtils} from "../../common/HoldUtils";
import {UpdateUtils} from "../../common/UpdateUtils";
import {isDateValid} from "@material-ui/data-grid";

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
	dateCreated: string;
	originalDateCreated: string;
	isDateCreatedEdited: boolean;
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
				{id: 'isTextEdited', label: '??', width: "5%", renderCell: this.renderIsTextEditedCell, padding: "none", headerTitle: "Is text changed?"},
				{id: 'text', label: 'Name', editable: true, editMaxLength: 255, cellClassName: 'tommable'},
				{id: 'isAuthorEdited', label: '??', width: "5%", renderCell: this.renderIsAuthorEditedCell, padding: "none", headerTitle: "Is author changed?"},
				{id: 'authorName', label: 'Author', editable: true, renderEditor: this.renderAuthorEditor, width: '30%'},
				{
					id: 'isDateCreatedEdited',
					label: '??',
					width: "5%",
					renderCell: this.renderIsDateCreatedEditedCell,
					padding: "none",
					headerTitle: "Is author changed?",
				},
				{id: 'dateCreated', label: 'Created', editable: true, width: '126px', renderEditor: this.renderCreatedEditor},
			],
		};
	}

	private handleResetTextRow = (id: number) => {
		const {hold} = this.state;
		const level = HoldUtils.getLevel(id, hold);

		UpdateUtils.levelName(level, level.name, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isTextEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleResetAuthorRow = (id: number) => {
		const {hold} = this.state;
		const level = HoldUtils.getLevel(id, hold);

		UpdateUtils.levelPlayerId(level, level.playerId, hold);

		const dataRow = this.getRowById(id);
		dataRow.authorId = dataRow.originalAuthorId;
		dataRow.authorName = dataRow.originalAuthorName;
		dataRow.isAuthorEdited = false;

		this._tableApi.current?.rerenderRow(dataRow.index);
	};

	private handleResetDateCreatedRow = (id: number) => {
		const {hold} = this.state;
		const level = HoldUtils.getLevel(id, hold);

		UpdateUtils.levelDateCreated(level, level.dateCreated, hold);

		const dataRow = this.getRowById(id);
		dataRow.dateCreated = dataRow.originalDateCreated;
		dataRow.isDateCreatedEdited = false;

		this._tableApi.current?.rerenderRow(dataRow.index);
	};

	private handleCellEdited = (row: LevelRow, field: string, newValue: string) => {
		if (field === 'text') {
			this.handleTextEdited(row, newValue);
		} else if (field === 'authorName') {
			this.handleAuthorEdited(row, newValue);
		} else if (field === 'dateCreated') {
			this.handleDateCreatedEdited(row, newValue);
		}
	};

	private handleTextEdited = (row: LevelRow, newValue: string) => {
		const {hold} = this.state;
		const level = HoldUtils.getLevel(row.id, hold);


		UpdateUtils.levelName(level, newValue, hold);

		this.getRowById(row.id).isTextEdited = level.changes.name !== undefined;
	};

	private handleAuthorEdited = (row: LevelRow, newValue: string) => {
		const playerId = parseInt(newValue);
		if (Number.isNaN(playerId)) {
			throw new Error(`Tried to set level author to non-numeric value '${newValue}'`);
		}

		const {hold} = this.state;
		const level = HoldUtils.getLevel(row.id, hold);
		const player = HoldUtils.getPlayer(playerId, hold);

		UpdateUtils.levelPlayerId(level, playerId, hold);

		row.authorId = playerId;
		row.authorName = PlayerUtils.getName(player);
		row.isAuthorEdited = level.changes.playerId !== undefined;
	};

	private handleDateCreatedEdited = (row: LevelRow, newValue: string) => {
		const newDate = parseISO(newValue);
		if (!isDateValid(newDate)) {
			Store.addSystemMessage({
				color: "error",
				message: `'${newValue}' is not a valid date format. Please use YYYY-MM-DD format, eg 2021-12-31.`,
			});
			return;

		}
		const {hold} = this.state;
		const level = HoldUtils.getLevel(row.id, hold);

		UpdateUtils.levelDateCreated(level, newDate, hold);

		row.dateCreated = newValue;
		row.isDateCreatedEdited = level.changes.dateCreated !== undefined;
	};

	private levelToRow(level: Level, hold: Hold): LevelRow {
		const playerId = level.changes.playerId ?? level.playerId;
		const originalPlayerId = level.playerId;
		const player = HoldUtils.getPlayer(playerId, hold);
		const originalPlayer = HoldUtils.getPlayer(originalPlayerId, hold);

		const dateCreated = DateUtils.formatDate(level.changes.dateCreated ?? level.dateCreated);
		const originalDateCreated = DateUtils.formatDate(level.dateCreated);

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
			dateCreated: dateCreated,
			originalDateCreated: originalDateCreated,
			isDateCreatedEdited: level.changes.dateCreated !== undefined,
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

	private renderIsDateCreatedEditedCell = (row: LevelRow) => {
		if (row.isDateCreatedEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetDateCreatedRow}
				originalText={row.originalDateCreated}/>;
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

	private renderCreatedEditor = (row: LevelRow, onCancel: () => void, onSave: (value: string) => void) => {
		return <DateEditor
			api={this._tableApi.current!}
			onCancel={onCancel}
			onSave={onSave}
			defaultValue={row.dateCreated}/>;
	};
}

interface DateEditorProps {
	api: EnchancedTableApi;
	onCancel: () => void;
	onSave: (newValue: string) => void;
	defaultValue: string;
}

const DateEditor = (props: DateEditorProps) => {
	const {api, onCancel, onSave, defaultValue} = props;

	const [view, setView] = useState<'year' | 'day' | 'month'>('day');

	const onChangeView = useCallback((view: 'year' | 'day' | 'month') => {
		setView(view);
	}, [setView]);
	const onChange = useCallback((value: Date | null) => {
		if (view === 'year') {
			setView('day');
		} else if (value) {
			onSave(DateUtils.formatDate(value));
		}
	}, [view, setView, onSave]);
	const onKeyDown = useCallback((event: { key: string }) => {
		if (event.key === 'Escape') {
			onCancel();
		}
	}, [onCancel]);

	useDocumentKeydown(onKeyDown, true);

	api.disableClickAwayClose();

	return <>
		<TextField value={defaultValue} variant="standard"/>
		<Dialog open={true} onBackdropClick={onCancel}>
			<DialogTitle>Select Date</DialogTitle>
			<CalendarPicker
				view={view}
				onViewChange={onChangeView}
				onChange={onChange}
				date={parseISO(defaultValue)}/>
		</Dialog>
	</>;

	// return <DatePicker
	// 	open={true}
	// 	value={defaultValue}
	// 	format="yyyy-MM-dd"
	// 	keyboardIcon={false}
	// 	KeyboardButtonProps={{
	// 		style: {display: 'none'}
	// 	}}
	// 	PopperProps={{
	// 		onClick: () => {api.suppressClickAwayForFrame(); alert("lol");}
	// 	}}
	// 	onChange={(a, b) => console.log(a, b)}/>;
};

interface AuthorEditorProps {
	api: EnchancedTableApi;
	onCancel: () => void;
	onSave: (newValue: string) => void;
	defaultValue: string;
	players: Player[]
}

const AuthorEditor = (props: AuthorEditorProps) => {
	const {api, onCancel, onSave, defaultValue, players} = props;

	const onChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
		onSave(event.target.value as string);
	}, [onSave]);

	const onKeyDown = useCallback((event: { key: string }) => {
		if (event.key === 'Escape') {
			onCancel();
		}
	}, [onCancel]);

	useEffect(() => {
		api.setDelayedClickAway(true);
		return () => api.setDelayedClickAway(false);
	});

	useDocumentKeydown(onKeyDown, true);

	return <Select
		autoFocus
		value={defaultValue}
		open={true}
		onChange={onChange}
		onKeyDown={onKeyDown}
	>
		{players.map(player => <MenuItem value={player.id.toString()} key={player.id}>
			{PlayerUtils.getName(player)}
		</MenuItem>)}
	</Select>;
};

export const LevelsTab = withStyles(styles)(_LevelsTab);