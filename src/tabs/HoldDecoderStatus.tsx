import {HoldDecoder} from "../holdDecoder/HoldDecoder";
import {LinearProgress, Typography} from "@material-ui/core";
import React from "react";

interface HoldDecoderStatusProps {
	decoder: HoldDecoder;
}

interface HoldDecoderStatusState {
	stepName: string;
	progressFactor: number;
}

export class HoldDecoderStatus extends React.Component<HoldDecoderStatusProps, HoldDecoderStatusState> {
	constructor(props: Readonly<HoldDecoderStatusProps> | HoldDecoderStatusProps) {
		super(props);

		this.state = {
			stepName: props.decoder.currentStep?.name ?? "Unknown step",
			progressFactor: props.decoder.progressFactor
		};
	}
	componentDidMount() {
		this.props.decoder.onUpdate.add(this.onDecoderUpdate);
	}

	componentWillUnmount() {
		this.props.decoder.onUpdate.remove(this.onDecoderUpdate);
	}

	private onDecoderUpdate = () => {
		const {decoder} = this.props;

		this.setState({
			progressFactor: decoder.progressFactor,
			stepName: decoder.currentStep?.name ?? 'Unknown step'
		});
	}

	render() {
		const {decoder} = this.props;
		const {progressFactor, stepName} = this.state;

		return <>
			<Typography variant="h5" noWrap align="center">
				Reading file {decoder.fileName}
			</Typography>
			{
				progressFactor === -1
					? <LinearProgress variant="indeterminate"/>
					: <LinearProgress variant="determinate" value={decoder.progressFactor * 100}/>
			}
			<Typography variant="subtitle1" align="center">
				{stepName ?? "All steps finished"}
			</Typography>
		</>;
	}
}