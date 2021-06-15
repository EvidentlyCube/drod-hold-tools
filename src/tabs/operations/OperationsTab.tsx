import { Grid, Theme } from "@material-ui/core";
import { createStyles, withStyles, WithStyles } from "@material-ui/styles";
import React from "react";
import { Hold } from "../../data/Hold";
import { Store } from "../../data/Store";
import { OperationsCsv } from "./OperationsCsv";

const styles = (theme: Theme) => createStyles({
	
});

interface OperationTabProps extends WithStyles<typeof styles> {
}

interface OperationTabState {
	hold: Hold;
}

class OperationTab extends React.Component<OperationTabProps, OperationTabState> {
	constructor(props: Readonly<OperationTabProps> | OperationTabProps) {
		super(props);

		this.state = {
			hold: Store.loadedHold.value
		};
	}

	render() {
		const {classes} = this.props;
		const {hold} = this.state;

		return <Grid container spacing={5}>
			<Grid item lg={6}>
				<OperationsCsv hold={hold} />
			</Grid>
			<Grid item lg={6}>
			</Grid>
		</Grid>;
	}
}

export default withStyles(styles)(OperationTab);