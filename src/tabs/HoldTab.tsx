import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {HoldDecoder} from "../holdDecoder/HoldDecoder";
import HoldDecoderStatus from "./HoldDecoderStatus";
import HoldSummary from "./HoldSummary";
import HoldPendingChanges from "./HoldPendingChanges";
import HoldUploader from "./HoldUploader";

interface HoldTabProps {
}

interface HoldTabState {
	hold: Hold;
	decoder: HoldDecoder;
	isHoldDecoding: boolean;
	isShowingError: boolean;
}

class HoldTab extends React.Component<HoldTabProps, HoldTabState> {
	constructor(props: Readonly<HoldTabProps> | HoldTabProps) {
		super(props);

		this.state = {
			hold: Store.loadedHold.value,
			decoder: new HoldDecoder(),
			isHoldDecoding: false,
			isShowingError: false,
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
		const {decoder} = this.state;
		this.setState({
			isHoldDecoding: decoder.isLoading,
			isShowingError: !!decoder.lastError,
			hold: decoder.hold,
		});
	};

	private onErrorClose = () => {
		this.setState({isShowingError: false});
	};

	public renderContent() {
		const {decoder, isHoldDecoding, hold} = this.state;

		if (isHoldDecoding) {
			return <HoldDecoderStatus decoder={decoder}/>;
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
		const {isShowingError, decoder} = this.state;
		return <Container maxWidth="lg">
			{this.renderContent()}
			<Dialog open={isShowingError} onClose={this.onErrorClose}>
				<DialogTitle>Reading file "{decoder.fileName}" failed</DialogTitle>
				<DialogContent>
					<DialogContentText>Please make sure you've selected a valid DROD 5.0.1 hold. If you are sure, please send the hold file to 'skell' on DROD forums.</DialogContentText>
					<DialogContentText>Reported error: {decoder.lastError}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.onErrorClose} color="primary" autoFocus>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Container>;
	}
}

export default HoldTab;