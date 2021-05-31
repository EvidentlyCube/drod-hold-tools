import {Box, createStyles, Paper, Snackbar, Theme, Typography, WithStyles, withStyles} from "@material-ui/core";
import React from "react";
import {HoldDecoder} from "../holdDecoder/HoldDecoder";
import {DropzoneAreaBase, FileObject} from "material-ui-dropzone";
import {Alert} from "@material-ui/lab";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});

interface HoldUploaderProps extends WithStyles<typeof styles> {
	holdDecoder: HoldDecoder;
}

interface HoldUploaderState {
	isSnackOpened: boolean;
	snackMessage: string;
	files: FileObject[];
}

class HoldUploader extends React.Component<HoldUploaderProps, HoldUploaderState> {
	constructor(props: Readonly<HoldUploaderProps> | HoldUploaderProps) {
		super(props);

		this.state = {
			isSnackOpened: false,
			snackMessage: '',
			files: [],
		};
	}

	private onDrop = (files: File[]) => {
		if (files.length === 0) {
			this.setState({
				isSnackOpened: true,
				snackMessage: "No file selected",
			});
		} else if (files.length > 1) {
			this.setState({
				isSnackOpened: true,
				snackMessage: "Only one file can be selected at a time",
			});
		}

		this.props.holdDecoder.startDecode(files[0]);
	};

	private onCloseSnack = () => {
		this.setState({isSnackOpened: false});
	};

	render() {
		const {classes} = this.props;
		const {isSnackOpened, files, snackMessage} = this.state;

		return <Paper className={classes.content}>
			<Box>
				<Typography variant="h4" gutterBottom>
					Upload a hold:
				</Typography>
				<Typography variant="subtitle2" gutterBottom>
					You can either drop a hold file or click the area below to select it.
				</Typography>
				<DropzoneAreaBase
					fileObjects={files}
					filesLimit={1}
					dropzoneText={"Drag and drop a hold here or click"}
					maxFileSize={1024 * 1024 * 1024}
					onDrop={this.onDrop}
					showAlerts={false}
				/>
			</Box>
			<Snackbar
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				autoHideDuration={6000}
				open={isSnackOpened}
				onClose={this.onCloseSnack}
			>
				<Alert onClose={this.onCloseSnack} severity="error">
					{snackMessage}
				</Alert>
			</Snackbar>

		</Paper>;
	}
}

export default withStyles(styles)(HoldUploader);