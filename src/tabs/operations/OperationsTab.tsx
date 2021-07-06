import {Grid} from "@material-ui/core";
import React from "react";
import {Hold} from "../../data/Hold";
import {Store} from "../../data/Store";
import {OperationsCsv} from "./OperationsCsv";
import {OperationsReplace} from "./OperationsReplace";

interface OperationTabProps {
}

interface OperationTabState {
	hold: Hold;
}

class OperationTab extends React.Component<OperationTabProps, OperationTabState> {
	constructor(props: Readonly<OperationTabProps> | OperationTabProps) {
		super(props);

		this.state = {
			hold: Store.loadedHold.value,
		};
	}

	render() {
		const {hold} = this.state;

		return <Grid container spacing={5}>
			<Grid item lg={6}>
				<OperationsCsv hold={hold}/>
			</Grid>
			<Grid item lg={6}>
				<OperationsReplace hold={hold}/>
			</Grid>
		</Grid>;
	}
}

export default OperationTab;