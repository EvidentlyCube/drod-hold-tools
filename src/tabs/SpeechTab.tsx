import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {Box, Checkbox, Container, createStyles, Theme, withStyles, WithStyles} from "@material-ui/core";
import {Speech} from "../data/Speech";
import {DataGrid, GridCellParams, GridColDef} from "@material-ui/data-grid";
import {assert} from "../common/Assert";
import {HoldUtils} from "../common/HoldUtils";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(8, 0, 6),
	},
	muted: {
		color: '#AAA',
		fontStyle: 'italic',
	},
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

		this.state = {
			hold: Store.loadedHold.value,
			rows: Array.from(Store.loadedHold.value.speeches.values()).map(speech => this.speechToRow(speech)),
			columns: [
				{field: "id", headerName: "ID", flex: 1},
				{field: "speech", headerName: "Text", flex: 5},
				{field: "location", headerName: "Location", flex: 3},
				{
					field: "delete", headerName: "Delete", flex: 1, renderCell: this.renderDeleteRow,
				},
			]
		};
	}

	private renderDeleteRow = (params: GridCellParams) => {
		const onClick = () => {
			this.onDeleteRowClicked(params.row.id);
		};
		return <Checkbox checked={params.value as boolean} onChange={onClick}/>;
	}

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
			model: speech
		});

		this.setState({rows});
	}

	private speechToRow(speech: Speech) {
		return {
			id: speech.id,
			speech: speech.text,
			location: speech.linked,
			delete: !!speech.isDeleted,
		};
	}

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
					sortingOrder={[]}/>

			</Container>
		</Box>;
	}
}

export default withStyles(styles)(SpeechTab);