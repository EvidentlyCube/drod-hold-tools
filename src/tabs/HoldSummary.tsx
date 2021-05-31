import {createStyles, Paper, Theme, Typography, WithStyles, withStyles} from "@material-ui/core";
import React from "react";
import {Hold} from "../data/Hold";
import {Container} from "@material-ui/core/";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(8, 0, 6),
	},
});

interface HoldSummaryProps extends WithStyles<typeof styles> {
	hold: Hold;
}

interface HoldSummaryState {
}

class HoldSummary extends React.Component<HoldSummaryProps, HoldSummaryState> {
	constructor(props: Readonly<HoldSummaryProps> | HoldSummaryProps) {
		super(props);

		this.state = {};
	}

	render() {
		const {hold, classes} = this.props;

		return <Container maxWidth="sm">
			<Paper className={classes.content}>
				<Typography variant="h5" noWrap align="center">
					{hold.name}
				</Typography>
				<Typography variant="subtitle1" noWrap align="center">
					by <strong>{hold.author.name}</strong>
				</Typography>
			</Paper>
		</Container>;
	}
}

export default withStyles(styles)(HoldSummary);