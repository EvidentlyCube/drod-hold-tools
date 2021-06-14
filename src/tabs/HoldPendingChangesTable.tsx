import {Store} from "../data/Store";
import {Hold} from "../data/Hold";
import React from "react";
import {EnchancedTableColumn} from "../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../common/components/EnchancedTable";
import {Change} from "../data/Change";
import {RoomUtils} from "../common/RoomUtils";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import {LocationUtils} from "../common/LocationUtils";
import {PlayerUtils} from "../common/PlayerUtils";
import {assert} from "../common/Assert";
import {DateUtils} from "../common/DateUtils";

let rowIdCounter = 1;

function newRow(type: string): ChangeRow {
	return {
		id: ++rowIdCounter,
		dataType: type,
		operationType: "",
		location: "",
		oldValue: "",
		newValue: "",
	};

}

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
				{id: 'id', label: 'ID', width: '5%', type: 'numeric'},
				{id: 'dataType', label: 'Data', width: "10%"},
				{id: 'operationType', label: 'Operation', width: "15%"},
				{id: 'location', label: 'Location', width: "20%"},
				{id: 'oldValue', label: 'Old Value'},
				{id: 'newValue', label: 'New Value'},
			],
		};
	}

	private static changeToRow(change: Change, hold: Hold): ChangeRow[] {
		const rows: ChangeRow[] = [];

		console.log(change);

		switch (change.type) {
			case "Speech": {
				const row = newRow(change.type);
				rows.push(row);
				row.location = change.model.source
					? LocationUtils.getDisplay(change.model.source, hold)
					: "Unknown";

				if (change.changes.delete) {
					row.operationType = "Delete";
					row.oldValue = change.model.text;

				} else {
					row.operationType = "Change Text";
					row.oldValue = change.model.text;
					row.newValue = change.model.changes.text ?? change.model.text;
				}
			}
				break;
			case "Entrance": {
				const row = newRow(change.type);
				rows.push(row);
				row.location = RoomUtils.getDisplayLocation(change.model.roomId, hold);

				if (change.changes.description) {
					row.operationType = "Change Description";
					row.oldValue = change.model.description;
					row.newValue = change.model.changes.description ?? change.model.description;
				}
			}
				break;
			case "Command": {
				const row = newRow(change.type);
				rows.push(row);

				row.location = LocationUtils.getDisplay(change.source, hold);
				if (change.changes.speechId) {
					row.operationType = "Change SpeechID";
					row.oldValue = change.model.speechId.toString();
					row.newValue = (change.model.changes.speechId || 0).toString();
				}
			}
				break;
			case "Scroll": {
				const row = newRow(change.type);
				rows.push(row);

				row.location = LocationUtils.getDisplay(change.model, hold);
				if (change.changes.text) {
					row.operationType = "Change Text";
					row.oldValue = change.model.text;
					row.newValue = change.model.changes.text;
				}
			}
				break;
			case "Level":
				if (change.changes.name !== undefined) {
					const row = newRow(change.type);
					rows.push(row);

					row.location = `#${change.model.index}`;
					row.operationType = "Change Name";
					row.oldValue = change.model.name;
					row.newValue = change.model.changes.name;
				}

				if (change.changes.playerId) {
					const oldPlayer = hold.players.get(change.model.playerId);
					const newPlayer = hold.players.get(change.model.changes.playerId!);
					assert(oldPlayer, `Failed to find player for id '${change.model.playerId}'`);
					assert(newPlayer, `Failed to find player for id '${change.model.changes.playerId}'`);

					const row = newRow(change.type);
					rows.push(row);

					row.location = `#${change.model.index}`;
					row.operationType = "Change Author";
					row.oldValue = PlayerUtils.getName(oldPlayer);
					row.newValue = PlayerUtils.getName(newPlayer);
				}
				if (change.changes.dateCreated) {
					const row = newRow(change.type);
					rows.push(row);

					row.location = `#${change.model.index}`;
					row.operationType = "Creation Date";
					row.oldValue = DateUtils.formatDate(change.model.dateCreated);
					row.newValue = DateUtils.formatDate(change.model.changes.dateCreated ?? change.model.dateCreated);
				}
				break;
			case "Character": {
				const row = newRow(change.type);
				rows.push(row);

				row.location = '';
				if (change.changes.name) {
					row.operationType = "Change Name";
					row.oldValue = change.model.name;
					row.newValue = change.model.changes.name;
				}
			}
				break;
			case "Hold":
				if (change.changes.name) {
					const row = newRow(change.type);
					rows.push(row);

					row.operationType = "Change Name";
					row.oldValue = change.model.name;
					row.newValue = change.model.changes.name;
				}
				if (change.changes.description) {
					const row = newRow(change.type);
					rows.push(row);

					row.operationType = "Change Description";
					row.oldValue = change.model.description;
					row.newValue = change.model.changes.description;
				}
				if (change.changes.ending) {
					const row = newRow(change.type);
					rows.push(row);

					row.operationType = "Change Ending";
					row.oldValue = change.model.ending;
					row.newValue = change.model.changes.ending;
				}
				break;
			case "Player":
				if (change.changes.create) {
					const row = newRow(change.type);
					rows.push(row);

					row.operationType = "Create";
					row.oldValue = "";
					row.newValue = change.model.name ?? change.model.changes.name;
				} else if (change.changes.delete) {
					const row = newRow(change.type);
					rows.push(row);

					row.operationType = "Delete";
					row.oldValue = change.model.name;
					row.newValue = '';
				} else if (change.changes.name) {
					const row = newRow(change.type);
					rows.push(row);

					row.operationType = "Rename";
					row.oldValue = change.model.name;
					row.newValue = change.model.changes.name;
				}
				break;
		}

		return rows;
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;
		return Array.from(hold.dataChanges.values())
			.map(change => _HoldPendingChangesTable.changeToRow(change, hold))
			.flat();
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