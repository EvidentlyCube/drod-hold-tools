import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {EnchancedTableColumn} from "../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../common/components/EnchancedTable";
import {Change} from "../data/Change";
import {RoomUtils} from "../common/RoomUtils";
import {createStyles, WithStyles} from "@material-ui/core";
import {withStyles} from "@material-ui/core/";
import {LocationUtils} from "../common/LocationUtils";

const RowsPerPage = 25;

const styles = () => createStyles({
	table: {
		'& .cell-oldValue': {
			whiteSpace: 'pre-wrap',
		},
		'& .cell-newValue': {
			whiteSpace: 'pre-wrap',
		},
	},
});

interface ChangeRow {
	id: number
	dataType: string;
	operationType: string;
	location: string;
	oldValue: string;
	newValue?: string;
}

interface HoldPendingChangesTableProps extends WithStyles<typeof styles> {
	hold: Hold;
}

interface HoldPendingChangesTableState {
	allRows: ChangeRow[];
	columns: EnchancedTableColumn[];
}

class _HoldPendingChangesTable extends React.Component<HoldPendingChangesTableProps, HoldPendingChangesTableState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<HoldPendingChangesTableProps> | HoldPendingChangesTableProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			allRows: allRows,
			columns: [
				{id: 'dataType', label: 'Data', width: "10%"},
				{id: 'operationType', label: 'Operation', width: "15%"},
				{id: 'location', label: 'Locaton', width: "20%"},
				{id: 'oldValue', label: 'Old Value'},
				{id: 'newValue', label: 'New Value'},
			],
		};
	}

	private static changeToRow(change: Change, hold: Hold, index: number): ChangeRow | undefined {
		const row: ChangeRow = {
			id: index,
			dataType: change.type,
			operationType: "",
			location: "",
			oldValue: "",
			newValue: "",
		};

		switch (change.type) {
			case "Speech":
				row.location = change.model.source
					? LocationUtils.getDisplay(change.model.source, hold)
					: "Unknown";

				if (change.changes.delete) {
					row.operationType = "Delete";
				} else {
					row.operationType = "Change Text";
					row.oldValue = change.model.text;
					row.newValue = change.model.changes.text ?? change.model.text;
				}
				break;
			case "Entrance":
				row.location = RoomUtils.getDisplayLocation(change.model.roomId, hold);

				if (change.changes.description) {
					row.operationType = "Change Description";
					row.oldValue = change.model.description;
					row.newValue = change.model.changes.description ?? change.model.description;
				}
				break;
			case "Command":
				row.location = LocationUtils.getDisplay(change.source, hold);
				if (change.changes.speechId) {
					row.operationType = "Change SpeechID";
					row.oldValue = change.model.speechId.toString();
					row.newValue = (change.model.changes.speechId || 0).toString();
				}
				break;
			case "Scroll":
				row.location = LocationUtils.getDisplay(change.model, hold);
				if (change.changes.text) {
					row.operationType = "Change Text";
					row.oldValue = change.model.text;
					row.newValue = change.model.changes.text;
				}
				break;
			case "Level":
				row.location = `#${change.model.index}`;
				if (change.changes.name) {
					row.operationType = "Change Name";
					row.oldValue = change.model.name;
					row.newValue = change.model.changes.name;
				}
		}

		return row;
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(hold.changes.values())
			.map((change, index) => _HoldPendingChangesTable.changeToRow(change, hold, index))
			.filter(x => !!x) as ChangeRow[];
	};

	public render() {
		const {classes} = this.props;
		const {allRows, columns} = this.state;

		return <EnchancedTable
			className={classes.table}
			columns={columns}
			rows={allRows}
			idField="id"
			rowsPerPage={RowsPerPage}
			apiRef={this._tableApi}
		/>;
	}
}

export const HoldPendingChangesTable = withStyles(styles)(_HoldPendingChangesTable);