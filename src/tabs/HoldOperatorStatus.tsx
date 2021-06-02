import {createStyles, LinearProgress, Paper, Theme, Typography, WithStyles, withStyles} from "@material-ui/core";
import React from "react";
import {HoldOperator} from "../common/CommonTypes";

const styles = (theme: Theme) => createStyles({
	content: {
		padding: theme.spacing(4, 6),
	},
});


interface HoldDecoderStatusProps extends WithStyles<typeof styles> {
	operator: HoldOperator;
}

interface HoldDecoderStatusState {
	stepName: string;
	progressFactor: number;
}

class HoldOperatorStatus extends React.Component<HoldDecoderStatusProps, HoldDecoderStatusState> {
	constructor(props: Readonly<HoldDecoderStatusProps> | HoldDecoderStatusProps) {
		super(props);

		this.state = {
			stepName: props.operator.currentStepName,
			progressFactor: props.operator.progressFactor,
		};
	}

	componentDidMount() {
		this.props.operator.onUpdate.add(this.onOperatorUpdate);
	}

	componentWillUnmount() {
		this.props.operator.onUpdate.remove(this.onOperatorUpdate);
	}

	private onOperatorUpdate = () => {
		const {operator} = this.props;

		this.setState({
			progressFactor: operator.progressFactor,
			stepName: operator.currentStepName,
		});
	};

	render() {
		const {operator, classes} = this.props;
		const {progressFactor, stepName} = this.state;

		return <Paper className={classes.content}>
			<Typography variant="h5" noWrap align="center" gutterBottom>
				Reading file "{operator.fileName || "Unknown file"}"
			</Typography>
			<Typography variant="subtitle1" align="center" gutterBottom>
				This may take a while and the browser can become unresponsive at times.
			</Typography>
			{
				progressFactor === -1
					? <LinearProgress variant="indeterminate"/>
					: <LinearProgress variant="determinate" value={operator.progressFactor * 100}/>
			}
			<Typography variant="subtitle1" align="center">
				{stepName ?? "All steps finished"}
			</Typography>
		</Paper>;
	}
}

export default withStyles(styles)(HoldOperatorStatus);