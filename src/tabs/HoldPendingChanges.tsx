import {createStyles, List, ListItem, ListItemText, Paper, Theme, Typography, WithStyles, withStyles} from "@material-ui/core";
import React from "react";
import {Hold} from "../data/Hold";
import {Change} from "../data/Change";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(8, 0, 6),
	},
});

interface HoldPendingChangesProps extends WithStyles<typeof styles> {
	hold: Hold;
}

interface HoldPendingChangesState {
}

class HoldPendingChanges extends React.Component<HoldPendingChangesProps, HoldPendingChangesState> {
	constructor(props: Readonly<HoldPendingChangesProps> | HoldPendingChangesProps) {
		super(props);

		this.state = {};
	}

	renderChange(change: Change, id: number) {
		switch (change.type) {
			case "Speech":
				const speechText = change.model.changes.text ?? change.model.text;
				if (change.changes.delete) {
					return <ListItem key={id}>
						<ListItemText>
							<strong>Delete speech #{change.model.id}:</strong> {speechText}
						</ListItemText>
					</ListItem>;
				} else if (change.changes.text) {
					return <ListItem key={id}>
						<ListItemText>
							<strong>Change speech #{change.model.id}:</strong> {speechText}
						</ListItemText>
					</ListItem>;
				} else {
					return null;
				}

		}
		return <li>

		</li>;
	}

	render() {
		const {hold, classes} = this.props;

		return <Paper className={classes.content}>
			<Typography variant="h5" noWrap align="center">
				Pending changes:
			</Typography>
			<List>
				{Array.from(hold.changes).map((change, index) => this.renderChange(change, index))}
			</List>
		</Paper>;
	}
}

export default withStyles(styles)(HoldPendingChanges);