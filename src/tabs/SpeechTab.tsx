import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {Box, Container, createStyles, IconButton, lighten, Paper, Switch, Theme, Tooltip, Typography, withStyles, WithStyles} from "@material-ui/core/";
import {Speech} from "../data/Speech";
import {DataGrid, GridCellParams, GridColDef, GridEditCellPropsParams, GridRowParams} from "@material-ui/data-grid";
import {assert} from "../common/Assert";
import {HoldUtils} from "../common/HoldUtils";
import {SpeechUtils} from "../common/SpeechUtils";
import {Delete, History, PlayArrow, PlayCircleOutline, Publish, SwapHoriz, SwapHorizOutlined, VolumeUp} from "@material-ui/icons";
import {CommandsUtils} from "../common/CommandsUtils";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),

		'& .to-delete': {
			backgroundColor: lighten(theme.palette.error.main, 0.6),
			'&:hover': {
				backgroundColor: lighten(theme.palette.error.main, 0.8),
			},
		}
	},
	muted: {
		color: '#AAA',
		fontStyle: 'italic',
	},
	deletedSpeech: {},
});

const LightTooltip = withStyles((theme: Theme) => ({
	tooltip: {
	  backgroundColor: theme.palette.common.white,
	  color: 'rgba(0, 0, 0, 0.87)',
	  boxShadow: theme.shadows[1],
	  fontSize: 11,
	},
  }))(Tooltip);

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

		this.state = {
			hold: Store.loadedHold.value,
			rows: this.getRows(),
			columns: [
				{field: "hasAudio", headerName: "Sound", width: 164, renderCell: this.renderSoundCell, align: "center"},
				{field: "isEdited", headerName: "Edited", width: 68, renderCell: this.renderIsEditedCell, align: "center"},
				{field: "text", headerName: "Text", flex: 1, renderCell: this.renderMessageRow, editable: true},
				{field: "command", headerName: "Command", width: 172},
				{field: "speaker", headerName: "Speaker", width: 172},
				{field: "location", headerName: "Location", width: 172},
				{
					field: "delete", headerName: "Delete", width: 78, renderCell: this.renderDeleteRow,
					sortable: false,
					filterable: false,
					hide: false,
					disableColumnMenu: true,
				},
			],
		};
	}

	private renderSoundCell = (params: GridCellParams) => {
		if (params.row.hasAudio) {
			return <React.Fragment>
				<LightTooltip title="Play Sound">
					<IconButton>
						<PlayArrow color="primary"/>
					</IconButton>
				</LightTooltip>
				<LightTooltip title="Replace Sound">
					<IconButton>
						<SwapHoriz color="primary"/>
					</IconButton>
				</LightTooltip>
				<LightTooltip title="Remove Sound">
					<IconButton>
						<Delete color="primary"/>
					</IconButton>
				</LightTooltip>
			</React.Fragment>
		}

		return <React.Fragment>
			<LightTooltip title="Play Sound">
				<IconButton disabled={true}>
					<PlayCircleOutline color="disabled"/>
				</IconButton>
			</LightTooltip>
			<LightTooltip title="Add Sound">
				<IconButton>
					<Publish color="primary"/>
				</IconButton>
			</LightTooltip>
			<LightTooltip title="Remove Sound">
				<IconButton disabled={true}>
					<Delete color="disabled"/>
				</IconButton>
			</LightTooltip>
		</React.Fragment>;
	}

	private renderIsEditedCell = (params: GridCellParams) => {
		if (params.row.isEdited) {
			return <LightTooltip title={<React.Fragment>
				<Typography variant="body2" gutterBottom><Box textAlign="center" fontWeight="fontWeightBold">Click to undo changes</Box></Typography>
				<Typography variant="body2">
					<Box fontSize={12} fontWeight="fontWeightMedium" display="inline">Original text:</Box>&nbsp;
					<Box fontSize={12} fontWeight="fontWeightLight" display="inline">{params.row.originalText}</Box>
				</Typography>
			</React.Fragment>}>
				<IconButton>
					<History onClick={e => this.resetRow(e, params.row.id)} color="primary"/>
				</IconButton>
			</LightTooltip>;
		}

		return <span/>;
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

		return params.row.deletable
			? <Switch checked={params.value as boolean} onChange={onClick}/>
			: <span/>;
	};

	private resetRow(event: React.MouseEvent, id: number) {
		event.preventDefault();
		event.stopPropagation();

		const {hold} = this.state;
		const speech = hold.speeches.get(id);
		assert(speech, `Failed to find speech with ID '${id}'`);
		delete(speech.changes.text);

		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {text: false},
		});

		this.setState({rows: this.getRows()});
	}

	private onDeleteRowClicked = (speechId: number) => {
		const {hold, rows} = this.state;

		const speech = hold.speeches.get(speechId);
		assert(speech, `Marking for deletion speech which does not exist #${speechId}`);

		speech.isDeleted = speech.isDeleted ? undefined : true;
		
		HoldUtils.addChange(hold, {
			type: "Speech",
			model: speech,
			changes: {delete: speech.isDeleted},
		});

		if (speech.command) {
			speech.command.changes.speechId = speech.isDeleted ? 0 : speech.id;

			HoldUtils.addChange(hold, {
				type: "Command",
				model: speech.command,
				changes: {speechId: speech.isDeleted},
			});
		}

		this.setState({rows: this.getRows()});
	};

	private static speechToRow(speech: Speech, hold: Hold) {
		return {
			id: speech.id,
			text: speech.changes.text ?? speech.text,
			originalText: speech.text,
			command: speech?.location?.commandName,
			speaker: SpeechUtils.getDisplaySpeaker(speech, hold),
			location: SpeechUtils.getDisplayLocation(speech),
			delete: !!speech.isDeleted,
			hasAudio: !!speech.dataId,
			isEdited: speech.changes.text !== undefined,
			deletable: speech.command ? !CommandsUtils.doesRequireSpeech(speech.command.command) : true
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

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(Store.loadedHold.value.speeches.values()).map(speech => SpeechTab.speechToRow(speech, hold));
	}

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

		for (const row of this.state.rows) {
			if (row.id === params.id) {
				row.isEdited = speech.changes.text !== undefined;
			}
		}

		this.setState({rows: this.getRows()});
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