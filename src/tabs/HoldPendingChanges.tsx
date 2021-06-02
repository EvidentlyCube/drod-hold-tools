import {
	Box,
	Button,
	createStyles,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemText,
	Paper,
	Theme,
	Typography,
	WithStyles,
	withStyles,
} from "@material-ui/core";
import React from "react";
import {createNullHold, Hold} from "../data/Hold";
import {Change} from "../data/Change";
import {Store} from "../data/Store";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
	divider: {
		margin: theme.spacing(4, 0),
	},
	actions: {
		textAlign: 'center',
		'& > *': {
			margin: theme.spacing(1),
		},
	},
});

interface HoldPendingChangesProps extends WithStyles<typeof styles> {
	hold: Hold;
}

interface HoldPendingChangesState {
	showExport: boolean;
	showClose: boolean;
}

class HoldPendingChanges extends React.Component<HoldPendingChangesProps, HoldPendingChangesState> {
	constructor(props: Readonly<HoldPendingChangesProps> | HoldPendingChangesProps) {
		super(props);

		this.state = {
			showExport: false,
			showClose: false,
		};
	}

	private onExport = () => {
		const {hold} = this.props;
		const {showExport} = this.state;

		if (showExport) {
			this.setState({showExport: false});
			Store.holdEncoder.startEncode(hold);

		} else {
			this.setState({showExport: true});
		}
	};

	private onCloseHold = () => {
		const {hold} = this.props;
		const {showClose} = this.state;

		if (hold.changes.size === 0 || showClose) {
			Store.loadedHold.value = createNullHold();
			this.setState({showClose: false});

		} else {
			this.setState({showClose: true});
		}
	};

	private onCancelDialog = () => {
		this.setState({
			showExport: false,
			showClose: false,
		});
	};

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
		const {showClose, showExport} = this.state;

		return <Paper className={classes.content}>
			<Typography variant="h5" noWrap align="center">
				Pending changes:
			</Typography>
			<List>
				{Array.from(hold.changes).map((change, index) => this.renderChange(change, index))}
			</List>
			<Divider className={classes.divider}/>
			<Box className={classes.actions}>
				<Button variant="contained" color="primary" onClick={this.onExport}>Export Hold with Changes</Button>
				<Button variant="contained" color="secondary" onClick={this.onCloseHold}>Close Hold</Button>
			</Box>
			<Dialog
				disableBackdropClick
				disableEscapeKeyDown
				maxWidth="xs"
				open={showExport}
			>
				<DialogTitle>Are you sure you want to export the hold?</DialogTitle>
				<DialogContent dividers>
					<DialogContentText>
						This will commit all of the pending changes. This operatin cannot be undone!
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={this.onCancelDialog} color="primary">
						Cancel
					</Button>
					<Button onClick={this.onExport} color="primary">
						Ok
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				disableBackdropClick
				disableEscapeKeyDown
				maxWidth="xs"
				open={showClose}
			>
				<DialogTitle>Are you sure you want to close the hold?</DialogTitle>
				<DialogContent dividers>
					<DialogContentText>
						You have unsaved changes and they will be lost.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={this.onCancelDialog} color="primary">
						Cancel
					</Button>
					<Button onClick={this.onCloseHold} color="primary">
						Ok
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>;
	}
}

export default withStyles(styles)(HoldPendingChanges);