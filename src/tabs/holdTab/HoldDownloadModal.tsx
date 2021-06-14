import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Theme} from "@material-ui/core";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import React from "react";
import {Store} from "../../data/Store";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});

interface HoldDownloadModalProps extends WithStyles<typeof styles> {
}

interface HoldDownloadModalState {
	isOpen: boolean;
	holdUrl: string;
	holdName: string;
}

class HoldDownloadModal extends React.Component<HoldDownloadModalProps, HoldDownloadModalState> {
	constructor(props: Readonly<HoldDownloadModalProps> | HoldDownloadModalProps) {
		super(props);

		this.state = {
			isOpen: false,
			holdUrl: '',
			holdName: '',
		};
	}

	componentDidMount() {
		Store.downloadableHold.addListener(this.onDownloadableHoldChanged);
	}

	componentWillUnmount() {
		Store.downloadableHold.removeListener(this.onDownloadableHoldChanged);
	}

	private onDownloadableHoldChanged = () => {
		const hold = Store.downloadableHold.value;

		this.setState({
			isOpen: hold !== undefined,
			holdName: Store.loadedHold.value.name,
			holdUrl: hold ? URL.createObjectURL(hold) : '',
		});
	};

	private onClose = () => {
		this.setState({isOpen: false, holdUrl: ''});
	};

	render() {
		const {isOpen, holdUrl, holdName} = this.state;

		return <Dialog
			disableEscapeKeyDown
			maxWidth="xs"
			open={isOpen}
		>
			<DialogTitle>Download {holdName}</DialogTitle>
			<DialogContent dividers>
				<DialogContentText>
					Your hold was exported with the requested changes. Click on the button below to download it.
				</DialogContentText>
				<Button variant="outlined" color="primary" download={`${holdName}.hold`} href={holdUrl}>Download hold</Button>
			</DialogContent>
			<DialogActions>
				<Button onClick={this.onClose} color="primary">
					Close
				</Button>
			</DialogActions>
		</Dialog>;
	}
}

export default withStyles(styles)(HoldDownloadModal);