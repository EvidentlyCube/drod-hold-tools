import {Store} from "../../data/Store";
import {Hold} from "../../data/Hold";
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core/";
import {assert} from "../../common/Assert";
import {ExpandMore} from "@material-ui/icons";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable, EnchancedTableApi} from "../../common/components/EnchancedTable";
import {ChangeUtils} from "../../common/ChangeUtils";
import {Character} from "../../data/Character";
import {IsEditedCell} from "../../common/components/IsEditedCell";

const RowsPerPage = 25;

interface CharacterRow {
	id: number;
	text: string;
	originalText: string;
	isEdited: boolean;
}

interface MiscCharactersProps {

}

interface MiscCharactersState {
	hold: Hold;
	allRows: CharacterRow[];
	columns: EnchancedTableColumn[];
}

export class MiscCharacters extends React.Component<MiscCharactersProps, MiscCharactersState> {
	private _tableApi = React.createRef<EnchancedTableApi>();

	constructor(props: Readonly<MiscCharactersProps> | MiscCharactersProps) {
		super(props);

		const allRows = this.getRows();
		this.state = {
			hold: Store.loadedHold.value,
			allRows: allRows,
			columns: [
				{id: 'id', label: 'ID', width: "5%", padding: "none"},
				{id: 'isEdited', label: 'Edited', width: "5%", renderCell: this.renderIsEditedCell, padding: "none"},
				{id: 'text', label: 'Name', editable: true, editMaxLength: 255},
			],
		};
	}

	private handleResetRow = (id: number) => {
		const {hold} = this.state;
		const character = hold.characters.get(id);
		assert(character, `Failed to find character with ID '${id}'`);
		delete (character.changes.name);

		ChangeUtils.characterName(character, hold);

		const dataRow = this.getRowById(id);
		dataRow.text = dataRow.originalText;
		dataRow.isEdited = false;

		this._tableApi.current?.rerenderRow(id);
	}

	private handleCellEdited = (row: any, field: string, newValue: string) => {
		const {hold} = this.state;
		const character = hold.characters.get(row.id as number);
		assert(character, `No character found for id '${row.id}'`);

		character.changes.name = newValue;
		if (character.name === character.changes.name) {
			delete (character.changes.name);
		}

		ChangeUtils.characterName(character, hold);

		this.getRowById(row.id).isEdited = character.changes.name !== undefined;
	};

	private static characterToRow(character: Character): CharacterRow {
		return {
			id: character.id,
			text: character.changes.name ?? character.name,
			originalText: character.name,
			isEdited: character.changes.name !== undefined,
		};
	}

	private getRows = () => {
		const hold = Store.loadedHold.value;

		return Array.from(hold.characters.values())
			.map(character => MiscCharacters.characterToRow(character));
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
			>Characters</AccordionSummary>
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

	private renderIsEditedCell = (row: CharacterRow) => {
		if (row.isEdited) {
			return <IsEditedCell
				rowId={row.id}
				resetHandler={this.handleResetRow}
				originalText={row.originalText}/>;
		}

		return <span/>;
	};
}