import {HoldDecoder} from "../holdDecoder/HoldDecoder";
import {createStyles, LinearProgress, Paper, Theme, Typography, WithStyles, withStyles} from "@material-ui/core";
import React from "react";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});


interface HoldDecoderStatusProps extends WithStyles<typeof styles> {
	decoder: HoldDecoder;
}

interface HoldDecoderStatusState {
	stepName: string;
	progressFactor: number;
}

class HoldDecoderStatus extends React.Component<HoldDecoderStatusProps, HoldDecoderStatusState> {
	constructor(props: Readonly<HoldDecoderStatusProps> | HoldDecoderStatusProps) {
		super(props);

		this.state = {
			stepName: props.decoder.currentStep?.name ?? "Unknown step",
			progressFactor: props.decoder.progressFactor,
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
			stepName: decoder.currentStep?.name ?? 'Unknown step',
		});
	};

	render() {
		const {decoder, classes} = this.props;
		const {progressFactor, stepName} = this.state;

		return <Paper className={classes.content}>
			<Typography variant="h5" noWrap align="center" gutterBottom>
				Reading file "{decoder.fileName || "Unknown file"}"
			</Typography>
			<Typography variant="subtitle1" align="center" gutterBottom>
				This may take a while and the browser can become unresponsive at times.
			</Typography>
			{
				progressFactor === -1
					? <LinearProgress variant="indeterminate"/>
					: <LinearProgress variant="determinate" value={decoder.progressFactor * 100}/>
			}
			<Typography variant="subtitle1" align="center">
				{stepName ?? "All steps finished"}
			</Typography>
		</Paper>;
	}
}

export default withStyles(styles)(HoldDecoderStatus);