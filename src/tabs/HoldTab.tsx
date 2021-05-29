import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {Container, createStyles, Theme, withStyles, WithStyles} from "@material-ui/core";
import {DropzoneAreaBase, FileObject} from "material-ui-dropzone";
import {HoldDecoder} from "../holdDecoder/HoldDecoder";
import {HoldDecoderStatus} from "./HoldDecoderStatus";
import HoldSummary from "./HoldSummary";
import HoldPendingChanges from "./HoldPendingChanges";

const styles = (theme: Theme) => createStyles({
	dropzone: {
		padding: theme.spacing(8, 0, 6),
	},
});

interface HoldTabProps extends WithStyles<typeof styles> {

}

interface HoldTabState {
	hold: Hold;
	decoder: HoldDecoder;
	fileObjects: FileObject[];
	isHoldDecoding: boolean;
}

class HoldTab extends React.Component<HoldTabProps, HoldTabState> {
	constructor(props: Readonly<HoldTabProps> | HoldTabProps) {
		super(props);

		this.state = {
			hold: Store.loadedHold.value,
			decoder: new HoldDecoder(),
			fileObjects: [],
			isHoldDecoding: false,
		};
	}

	componentDidMount() {
		Store.loadedHold.addListener(this.handleLoadedHoldChange);
		this.state.decoder.onUpdate.add(this.handleDecoderUpdate);
	}

	componentWillUnmount() {
		Store.loadedHold.removeListener(this.handleLoadedHoldChange);
		this.state.decoder.onUpdate.remove(this.handleDecoderUpdate);
	}

	private handleLoadedHoldChange = (hold: Hold) => {
		this.setState({hold});
	};

	private handleDecoderUpdate = () => {
		this.setState({
			isHoldDecoding: this.state.decoder.isLoading,
			hold: this.state.decoder.hold,
		});
	};

	public render() {
		const {decoder, fileObjects, isHoldDecoding, hold} = this.state;
		const {classes} = this.props;

		if (isHoldDecoding) {
			return <div className={classes.dropzone}>
				<Container maxWidth="sm">
					<HoldDecoderStatus decoder={decoder}/>
				</Container>
			</div>;
		} else if (hold.isLoaded) {
			return <>
				<HoldSummary hold={hold}/>
				<HoldPendingChanges hold={hold}/>
			</>;
		} else {
			return <div className={classes.dropzone}>
				<Container maxWidth="sm">
					<DropzoneAreaBase
						fileObjects={fileObjects}
						filesLimit={1}
						dropzoneText={"Drag and drop a hold here or click"}
						maxFileSize={1024 * 1024 * 1024}
						onDrop={(files) => {
							decoder.startDecode(files[0]);
						}}
						showAlerts={false}
					/>
				</Container>
			</div>;
		}
	}
}

export default withStyles(styles)(HoldTab);