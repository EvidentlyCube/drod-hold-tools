import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {
	Box,
	Container,
	createStyles,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Theme,
	withStyles,
	WithStyles,
} from "@material-ui/core";
import {Speech} from "../data/Speech";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(8, 0, 6),
	},
	muted: {
		color: '#AAA',
		fontStyle: 'italic'
	}
});

interface SpeechTabProps extends WithStyles<typeof styles> {

}

interface SpeechTabState {
	hold: Hold;
	speeches: Speech[]
}

class SpeechTab extends React.Component<SpeechTabProps, SpeechTabState> {
	constructor(props: Readonly<SpeechTabProps> | SpeechTabProps) {
		super(props);

		this.state = {
			hold: Store.loadedHold.value,
			speeches: Array.from(Store.loadedHold.value.speeches.values()),
		};
	}

	public render() {
		const {classes} = this.props;
		const {speeches} = this.state;

		return <Box className={classes.content}>
			<Container maxWidth="lg">
				<TableContainer component={Paper}>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>Speech</TableCell>
								<TableCell>Source</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{speeches.map(speech => {
								return <TableRow key={speech.id}>
									<TableCell>{speech.text}</TableCell>
									<TableCell>{speech.linked
										? speech.linked
										: <span className={classes.muted}>Not Linked</span>
									}</TableCell>
								</TableRow>;
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Container>
		</Box>;
	}
}

export default withStyles(styles)(SpeechTab);