import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {Box, Container, createStyles, lighten, Switch, Theme, withStyles, WithStyles} from "@material-ui/core/";
import {Speech} from "../data/Speech";
import {DataGrid, GridCellParams, GridColDef, GridRowParams} from "@material-ui/data-grid";
import {assert} from "../common/Assert";
import {HoldUtils} from "../common/HoldUtils";
import {SpeechUtils} from "../common/SpeechUtils";
import {VolumeUp} from "@material-ui/icons";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(8, 0, 6),

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
				{field: "speech", headerName: "Text", flex: 6, renderCell: this.renderMessageRow},
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
			{hasAudio && <VolumeUp color="primary" style={{marginRight: "8px"}} />}
			{params.value as string}
		</>
	}

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
		});

		this.setState({rows});
	};

	private speechToRow(speech: Speech, hold: Hold) {
		return {
			id: speech.id,
			speech: speech.text,
			command: speech?.location?.commandName,
			speaker: SpeechUtils.getDisplaySpeaker(speech, hold),
			location: SpeechUtils.getDisplayLocation(speech),
			delete: !!speech.isDeleted,
			hasAudio: !!speech.dataId
		};
	}

	private getRawClassName = (params: GridRowParams) => {
		return params.getValue(params.id, 'delete') ? 'to-delete' : '';
	};

	public render() {
		const {classes} = this.props;
		const {rows, columns} = this.state;

		return <Box className={classes.content}>
			<Container maxWidth="lg">
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
					sortingOrder={[]}/>

			</Container>
		</Box>;
	}
}

export default withStyles(styles)(SpeechTab);