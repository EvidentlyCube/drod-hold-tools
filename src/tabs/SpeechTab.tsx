import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {Container, createStyles, lighten, Paper, Switch, Theme, Typography, withStyles, WithStyles} from "@material-ui/core/";
import {Speech} from "../data/Speech";
import {DataGrid, GridCellParams, GridColDef, GridEditCellPropsParams, GridRowParams} from "@material-ui/data-grid";
import {assert} from "../common/Assert";
import {HoldUtils} from "../common/HoldUtils";
import {SpeechUtils} from "../common/SpeechUtils";
import {VolumeUp} from "@material-ui/icons";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),

		'& .to-delete': {
			backgroundColor: lighten(theme.palette.error.main, 0.6),
			'&:hover': {
				backgroundColor: lighten(theme.palette.error.main, 0.8),
			},
		},
	},
	muted: {
		color: '#AAA',
		fontStyle: 'italic',
	},
	deletedSpeech: {},
});

interface SpeechTabProps extends WithStyles<typeof styles> {

}

interface SpeechTabState {
	hold: Hold;
	rows: any[];
	columns: GridColDef[]
}

class SpeechTab extends React.Component<SpeechTabProps, SpeechTabState> {
	constructor(props: Readonly<SpeechTabProps> | SpeechTabProps) {
		super(props);

		const hold = Store.loadedHold.value;
		this.state = {
			hold: hold,
			rows: Array.from(Store.loadedHold.value.speeches.values()).map(speech => this.speechToRow(speech, hold)),
			columns: [
				{field: "id", headerName: "ID", flex: 1, disableColumnMenu: true},
				{field: "text", headerName: "Text", flex: 6, renderCell: this.renderMessageRow, editable: true},
				{field: "command", headerName: "Command", flex: 2},
				{field: "speaker", headerName: "Speaker", flex: 2},
				{field: "location", headerName: "Location", flex: 2},
				{
					field: "delete", headerName: "Delete", flex: 1, renderCell: this.renderDeleteRow,
					sortable: false,
					filterable: false,
					hide: false,
					disableColumnMenu: true,

				},
			],
		};
	}

	private renderMessageRow = (params: GridCellParams) => {
		const hasAudio = params.row.hasAudio;

		return <>
			{hasAudio && <VolumeUp color="primary" style={{marginRight: "8px"}}/>}
			{params.value as string}
		</>;
	};

	private renderDeleteRow = (params: GridCellParams) => {
		const onClick = () => {
			this.onDeleteRowClicked(params.row.id);
		};
		return <Switch checked={params.value as boolean} onChange={onClick}/>;
	};

	private onDeleteRowClicked = (speechId: number) => {
		const {hold, rows} = this.state;

		const speech = hold.speeches.get(speechId);
		assert(speech, `Marking for deletion speech which does not exist #${speechId}`);

		speech.isDeleted = speech.isDeleted ? undefined : true;
		for (const row of rows) {
			if (row.id === speechId) {
				row.delete = !!speech.isDeleted;
			}
		}

		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {delete: speech.isDeleted},
		});

		this.setState({rows});
	};

	private speechToRow(speech: Speech, hold: Hold) {
		return {
			id: speech.id,
			text: speech.changes.text ?? speech.text,
			command: speech?.location?.commandName,
			speaker: SpeechUtils.getDisplaySpeaker(speech, hold),
			location: SpeechUtils.getDisplayLocation(speech),
			delete: !!speech.isDeleted,
			hasAudio: !!speech.dataId,
		};
	}

	private getRawClassName = (params: GridRowParams) => {
		return params.getValue(params.id, 'delete') ? 'to-delete' : '';
	};

	private handleCellClick = (params: GridCellParams) => {
		if (params.field === 'text' && params.api.setCellMode) {
			params.api.setCellMode(params.id, 'text', "edit");
		}
	};
	private handleCellEdited = (params: GridEditCellPropsParams) => {
		const {hold} = this.state;
		const speech = hold.speeches.get(params.id as number);
		assert(speech, `No speech found for id '${params.id}'`);

		speech.changes.text = params.props.value ? params.props.value.toString() : '';
		if (speech.text === speech.changes.text) {
			delete (speech.changes.text);
		}

		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {text: !!speech.changes.text},
		});
	};

	public render() {
		const {classes} = this.props;
		const {rows, columns} = this.state;

		return <Container maxWidth="xl">
			<Paper className={classes.content}>
				<Typography variant="h5" gutterBottom>
					Commands text
				</Typography>
				<Typography variant="body1" gutterBottom>
					This table contains all the texts from all the commands in every character (custom character's default script & placed character). Click on the text to edit it, press enter to save changes.
				</Typography>
				<DataGrid
					columns={columns}
					rows={rows}
					autoHeight={true}
					columnBuffer={2}
					columnTypes={{}}
					density={'standard'}
					headerHeight={56}
					localeText={{}}
					rowHeight={52}
					pageSize={25}
					disableSelectionOnClick={true}
					getRowClassName={this.getRawClassName}
					onCellClick={this.handleCellClick}
					onEditCellChangeCommitted={this.handleCellEdited}
					sortingOrder={[]}/>
			</Paper>

		</Container>;
	}
}

export default withStyles(styles)(SpeechTab);