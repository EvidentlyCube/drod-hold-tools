import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Container, Paper, Theme, Typography} from "@material-ui/core/";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {MiscCharacters} from "./MiscCharacters";
import {MiscHoldName} from "./MiscHoldName";
import {MiscHoldDescription} from "./MiscHoldDescription";
import {MiscHoldEnding} from "./MiscHoldEnding";

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
				<MiscCharacters/>
				<MiscHoldName/>
				<MiscHoldDescription/>
				<MiscHoldEnding/>
			</Paper>
		</Container>;
	}
}

export default withStyles(styles)(MiscTab);