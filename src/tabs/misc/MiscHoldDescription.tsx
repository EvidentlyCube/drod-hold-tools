import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core/";
import {ExpandMore} from "@material-ui/icons";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {IsEditedCell} from "../../common/components/IsEditedCell";

const RowsPerPage = 25;

interface HoldRow {
	id: number;
	text: string;
	originalText: string;
	isEdited: boolean;
}

interface MiscHoldDescriptionProps {

}

interface MiscHoldDescriptionState {
	hold: Hold;
	allRows: HoldRow[];
	columns: EnchancedTableColumn[];
}

export class MiscHoldDescription extends React.Component<MiscHoldDescriptionProps, MiscHoldDescriptionState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<MiscHoldDescriptionProps> | MiscHoldDescriptionProps) {
		super(props);

		const hold = Store.loadedHold.value;
		this.state = {
			hold,
			allRows: [{
				id: 1,
				text: hold.changes.description ?? hold.description,
				originalText: hold.description,
				isEdited: hold.changes.description !== undefined,
			}],
			columns: [
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Name', editable: true, editMaxLength: 1350, editMultiline: true},
			],
		};
	}

	private handleResetRow = () => {
		const {hold, allRows} = this.state;

		delete (hold.changes.description);

		ChangeUtils.holdDescription(hold);

		const dataRow = allRows[0];
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerender();
	}

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold, allRows} = this.state;

		hold.changes.description = newValue;
		if (hold.description === hold.changes.description) {
			delete hold.changes.description;
		}

		ChangeUtils.holdDescription(hold);

		allRows[0].isEdited = hold.changes.description !== undefined;
	};

	public render() {
		const {allRows, columns} = this.state;

		return <Accordion>
			<AccordionSummary
				expandIcon={<ExpandMore/>}
			>Hold Description</AccordionSummary>
			<AccordionDetails>
				<EnchancedTable
					columns={columns}
					rows={allRows}
					idField="id"
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