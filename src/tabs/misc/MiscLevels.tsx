import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core/";
import {assert} from "../../common/Assert";
import {ExpandMore} from "@material-ui/icons";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {Level} from "../../data/Level";
import {IsEditedCell} from "../../common/components/IsEditedCell";

const RowsPerPage = 25;

interface LevelRow {
	id: number;
	index: number;
	text: string;
	originalText: string;
	isEdited: boolean;
}

interface MiscLevelsProps {

}

interface MiscLevelsState {
	hold: Hold;
	allRows: LevelRow[];
	columns: EnchancedTableColumn[];
}

export class MiscLevels extends React.Component<MiscLevelsProps, MiscLevelsState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<MiscLevelsProps> | MiscLevelsProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			allRows: allRows,
			columns: [
				{id: 'index', label: 'Index', width: "5%", padding: "none"},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Name', editable: true, editMaxLength: 255},
			],
		};
	}

	private handleResetRow(id: number) {
		const {hold} = this.state;
		const level = hold.levels.get(id);
		assert(level, `Failed to find level with ID '${id}'`);
		delete (level.changes.name);

		ChangeUtils.levelName(level, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	}

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold} = this.state;
		const level = hold.levels.get(row.id as number);
		assert(level, `No level found for id '${row.id}'`);

		level.changes.name = newValue;
		if (level.name === level.changes.name) {
			delete (level.changes.name);
		}

		ChangeUtils.levelName(level, hold);

		this.getRowById(row.id).isEdited = level.changes.name !== undefined;
	};

	private static levelToRow(level: Level): LevelRow {
		return {
			id: level.id,
			index: level.index,
			text: level.changes.name ?? level.name,
			originalText: level.name,
			isEdited: level.changes.name !== undefined,
		};
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;

		return Array.from(hold.levels.values())
			.map(level => MiscLevels.levelToRow(level));
	};

	private getRowById = (id: number) => {
		for (const checkedRow of this.state.allRows) {
			if (checkedRow.id === id) {
				return checkedRow;
			}
		}

		throw new Error(`Failed to find row with ID '${id}'`);
	};

	public render() {
		const {allRows, columns} = this.state;

		return <Accordion>
			<AccordionSummary
				expandIcon={<ExpandMore/>}
			>Levels</AccordionSummary>
			<AccordionDetails>
				<EnchancedTable
					columns={columns}
					rows={allRows}
					idField="id"
					rowsPerPage={RowsPerPage}
					onEditedCell={this.handleCellEdited}
					apiRef={this._tableApi}
				/>
			</AccordionDetails>
		</Accordion>;
	}

	private renderIsEditedCell = (row: LevelRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};
}