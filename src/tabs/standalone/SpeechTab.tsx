import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Box, Container, createStyles, IconButton, Paper, Switch, Theme, Typography, withStyles, WithStyles} from "@material-ui/core/";
import {Speech} from "../../data/Speech";
import {assert} from "../../common/Assert";
import {HoldUtils} from "../../common/HoldUtils";
import {SpeechUtils} from "../../common/SpeechUtils";
import {History} from "@material-ui/icons";
import {CommandsUtils} from "../../common/CommandsUtils";
import {LightTooltip} from "../../common/components/LightTooltip";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";

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
				{id: 'text', label: 'Text', editable: true, editMaxLength: 1024},
				{id: 'command', label: 'Command', width: "15%"},
				{id: 'speaker', label: 'Speaker', width: "15%"},
				{id: 'location', label: 'Location', width: "15%"},
				{id: 'isDeleted', label: 'Delete', width: "5%", sortable: false, padding: "none", renderCell: this.renderDeleteRow},
			],
		};
	}

	private handleResetRow(event: React.MouseEvent, id: number) {
		event.preventDefault();
		event.stopPropagation();

		const {hold} = this.state;
		const speech = hold.speeches.get(id);
		assert(speech, `Failed to find speech with ID '${id}'`);
		delete (speech.changes.text);

		ChangeUtils.speechText(speech, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	}

	private handleDeleteRowClicked = (speechId: number) => {
		const {hold} = this.state;

		const speech = hold.speeches.get(speechId);
		assert(speech, `Marking for deletion speech which does not exist #${speechId}`);

		speech.isDeleted = speech.isDeleted ? undefined : true;

		ChangeUtils.speechDelete(speech, hold);
		this.getRowById(speechId).isDeleted = speech.isDeleted || false;

		this._tableApi.current?.rerenderRow(speechId);
	};

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold} = this.state;
		const speech = hold.speeches.get(row.id as number);
		assert(speech, `No speech found for id '${row.id}'`);

		speech.changes.text = newValue;
		if (speech.text === speech.changes.text) {
			delete (speech.changes.text);
		}

		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {text: !!speech.changes.text},
		});

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
			isDeleted: !!speech.isDeleted,
			hasData: !!speech.dataId,
			isEdited: speech.changes.text !== undefined,
			isDeletable: speech.command ? !CommandsUtils.doesRequireSpeech(speech.command.command) : true,
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