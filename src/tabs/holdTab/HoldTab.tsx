import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {HoldDecoder} from "../../holdDecoder/HoldDecoder";
import HoldOperatorStatus from "./HoldOperatorStatus";
import HoldSummary from "./HoldSummary";
import HoldPendingChanges from "./HoldPendingChanges";
import HoldUploader from "./HoldUploader";
import {HoldEncoder} from "../../holdEncoder/HoldEncoder";
import HoldDownloadModal from "./HoldDownloadModal";

interface HoldTabProps {
}

interface HoldTabState {
	hold: Hold;
	decoder: HoldDecoder;
	encoder: HoldEncoder;
	isHoldDecoding: boolean;
	isHoldEncoding: boolean;
	holdDecoderError: string;
	holdEncoderError: string;
}

class HoldTab extends React.Component<HoldTabProps, HoldTabState> {
	constructor(props: Readonly<HoldTabProps> | HoldTabProps) {
		super(props);

		this.state = {
			hold: Store.loadedHold.value,
			decoder: Store.holdDecoder,
			encoder: Store.holdEncoder,
			isHoldDecoding: false,
			isHoldEncoding: false,
			holdDecoderError: '',
			holdEncoderError: '',
		};
	}

	componentDidMount() {
		Store.loadedHold.addListener(this.handleLoadedHoldChange);
		this.state.decoder.onUpdate.add(this.handleDecoderUpdate);
		this.state.encoder.onUpdate.add(this.handleEncoderUpdate);
	}

	componentWillUnmount() {
		Store.loadedHold.removeListener(this.handleLoadedHoldChange);
		this.state.decoder.onUpdate.remove(this.handleDecoderUpdate);
		this.state.encoder.onUpdate.remove(this.handleEncoderUpdate);
	}

	private handleLoadedHoldChange = (hold: Hold) => {
		this.setState({hold});
	};

	private handleDecoderUpdate = () => {
		const {decoder} = this.state;
		this.setState({
			isHoldDecoding: decoder.isRunning,
			holdDecoderError: decoder.lastError,
		});
	};

	private handleEncoderUpdate = () => {
		const {encoder} = this.state;
		this.setState({
			isHoldEncoding: encoder.isRunning,
			holdEncoderError: encoder.lastError,
		});
	};

	private onErrorClose = () => {
		this.setState({holdDecoderError: '', holdEncoderError: ''});
	};

	public renderContent() {
		const {decoder, encoder, isHoldDecoding, isHoldEncoding, hold} = this.state;

		if (isHoldEncoding || isHoldDecoding) {
			return <HoldOperatorStatus operator={isHoldEncoding ? encoder : decoder}/>;

		} else if (hold.isLoaded) {
			return <>
				<HoldSummary hold={hold}/>
				<HoldPendingChanges hold={hold}/>
			</>;
		} else {
			return <HoldUploader holdDecoder={decoder}/>;
		}
	}

	public render() {
		const {holdDecoderError, holdEncoderError, decoder, hold} = this.state;
		return <Container maxWidth="xl">
			{this.renderContent()}
			<Dialog open={!!holdDecoderError} onClose={this.onErrorClose}>
				<DialogTitle>Reading file "{decoder.fileName}" failed</DialogTitle>
				<DialogContent>
					<DialogContentText>Please make sure you've selected a valid DROD 5.0.1 hold. If you are sure, please send the hold file to 'skell' on DROD forums.</DialogContentText>
					<DialogContentText>Reported error: {holdDecoderError}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.onErrorClose} color="primary" autoFocus>
						Close
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={!!holdEncoderError} onClose={this.onErrorClose}>
				<DialogTitle>Exporting hold "{hold.name}" failed</DialogTitle>
				<DialogContent>
					<DialogContentText>It appears something went wrong.</DialogContentText>
					<DialogContentText>Reported error: {holdEncoderError}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.onErrorClose} color="primary" autoFocus>
						Close
					</Button>
				</DialogActions>
			</Dialog>
			<HoldDownloadModal/>
		</Container>;
	}
}

export default HoldTab;