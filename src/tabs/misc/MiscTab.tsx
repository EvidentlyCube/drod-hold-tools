import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, createStyles, Paper, Theme, Typography, withStyles, WithStyles} from "@material-ui/core/";
import {MiscLevels} from "./MiscLevels";
import {MiscCharacters} from "./MiscCharacters";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});

interface MiscTabProps extends WithStyles<typeof styles> {

}

interface MiscTabState {
	hold: Hold;
}

class MiscTab extends React.Component<MiscTabProps, MiscTabState> {

	constructor(props: Readonly<MiscTabProps> | MiscTabProps) {
		super(props);

		this.state = {
			hold: Store.loadedHold.value,
		};
	}

	public render() {
		const {classes} = this.props;

		return <Container maxWidth="xl">
			<Paper className={classes.content}>
				<Typography variant="h5" gutterBottom>
					Various data
				</Typography>
				<MiscLevels/>
				<MiscCharacters/>
			</Paper>
		</Container>;
	}
}

export default withStyles(styles)(MiscTab);