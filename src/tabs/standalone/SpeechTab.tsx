import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, Paper, Switch, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {Speech} from "../../data/Speech";
import {HoldUtils} from "../../common/HoldUtils";
import {SpeechUtils} from "../../common/SpeechUtils";
import {CommandsUtils} from "../../common/CommandsUtils";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {UpdateUtils} from "../../common/UpdateUtils";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});

const RowsPerPage = 25;

interface SpeechRow {
	id: number
	text: string
	originalText: string
	command: string
	speaker: string
	location: string
	isEdited: boolean;
	isDeleted: boolean;
	isDeletable: boolean;
	hasData: boolean;
}

interface SpeechTabProps extends WithStyles<typeof styles> {

}

interface SpeechTabState {
	hold: Hold;
	allRows: SpeechRow[];
	columns: EnchancedTableColumn[];
}

class SpeechTab extends React.Component<SpeechTabProps, SpeechTabState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<SpeechTabProps> | SpeechTabProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none"},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Text', editable: true, editMaxLength: 1024, cellClassName: 'tommable'},
				{id: 'command', label: 'Command', width: "15%"},
				{id: 'speaker', label: 'Speaker', width: "15%"},
				{id: 'location', label: 'Location', width: "15%"},
				{id: 'isDeleted', label: 'Delete', width: "5%", sortable: false, padding: "none", renderCell: this.renderDeleteRow},
			],
		};
	}

	private handleResetRow = (id: number) => {
		const {hold} = this.state;
		const speech = HoldUtils.getSpeech(id, hold);

		UpdateUtils.speechText(speech, speech.text, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	};

	private handleDeleteRowClicked = (speechId: number) => {
		const {hold} = this.state;
		const speech = HoldUtils.getSpeech(speechId, hold);

		UpdateUtils.speechDeleted(speech, !speech.isDeleted, hold)

		this.getRowById(speechId).isDeleted = speech.isDeleted;

		this._tableApi.current?.rerenderRow(speechId);
	};

	private handleCellEdited = (row: SpeechRow, field: string, newValue: string) => {
		const {hold} = this.state;
		const speech = HoldUtils.getSpeech(row.id, hold);

		UpdateUtils.speechText(speech, newValue, hold);

		this.getRowById(row.id).isEdited = speech.changes.text !== undefined;
	};

	private static speechToRow(speech: Speech, hold: Hold): SpeechRow {
		return {
			id: speech.id,
			text: speech.changes.text ?? speech.text,
			originalText: speech.text,
			command: speech?.location?.commandName ?? '',
			speaker: SpeechUtils.getDisplaySpeaker(speech, hold),
			location: SpeechUtils.getDisplayLocation(speech) ?? '',
			isDeleted: speech.isDeleted,
			hasData: !!speech.dataId,
			isEdited: speech.changes.text !== undefined,
			isDeletable: !CommandsUtils.doesRequireSpeech(speech.command.command),
		};
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(Store.loadedHold.value.speeches.values()).map(speech => SpeechTab.speechToRow(speech, hold));
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

	private renderIsEditedCell = (row: SpeechRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};

	private renderDeleteRow = (row: SpeechRow) => {
		const onClick = () => {
			this.handleDeleteRowClicked(row.id);
		};

		return row.isDeletable
			? <Switch checked={row.isDeleted} onChange={onClick}/>
			: <span/>;
	};
}

export default withStyles(styles)(SpeechTab);