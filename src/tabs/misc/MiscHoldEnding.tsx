import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core/";
import {ExpandMore} from "@material-ui/icons";
import {EnchancedTableApi, EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable} from "../../common/components/EnchancedTable";
import {IsEditedCell} from "../../common/components/IsEditedCell";
import {UpdateUtils} from "../../common/UpdateUtils";

const RowsPerPage = 25;

interface HoldRow {
	id: number;
	text: string;
	originalText: string;
	isEdited: boolean;
}

interface MiscHoldEndingProps {

}

interface MiscHoldEndingState {
	hold: Hold;
	allRows: HoldRow[];
	columns: EnchancedTableColumn[];
}

export class MiscHoldEnding extends React.Component<MiscHoldEndingProps, MiscHoldEndingState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<MiscHoldEndingProps> | MiscHoldEndingProps) {
		super(props);

		const hold = Store.loadedHold.value;
		this.state = {
			hold,
			allRows: [{
				id: 1,
				text: hold.changes.ending ?? hold.ending,
				originalText: hold.ending,
				isEdited: hold.changes.ending !== undefined,
			}],
			columns: [
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none", sortable: false},
				{id: 'text', label: 'Name', editable: true, editMaxLength: 1350, editMultiline: true, sortable: false, cellClassName: 'tommable'},
			],
		};
	}

	private handleResetRow = () => {
		const {hold, allRows} = this.state;

		UpdateUtils.holdEnding(hold, hold.ending);

		const dataRow = allRows[0];
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerender();
	};

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold, allRows} = this.state;

		UpdateUtils.holdEnding(hold, newValue);

		allRows[0].isEdited = hold.changes.ending !== undefined;
	};

	public render() {
		const {allRows, columns} = this.state;

		return <Accordion>
			<AccordionSummary
				expandIcon={<ExpandMore/>}
			>Hold Ending</AccordionSummary>
			<AccordionDetails>
				<EnchancedTable
					columns={columns}
					rows={allRows}
					idField="isEdited"
					rowsPerPage={RowsPerPage}
					pagination={false}
					onEditedCell={this.handleCellEdited}
					apiRef={this._tableApi}
				/>
			</AccordionDetails>
		</Accordion>;
	}

	private renderIsEditedCell = (row: HoldRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};
}