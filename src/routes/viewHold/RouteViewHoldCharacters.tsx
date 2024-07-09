import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldCharacter } from "../../data/datatypes/HoldCharacter";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareString } from "../../utils/SortUtils";

const Columns: SortableTableColumn<HoldCharacter>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		canHide: true,

		render: character => character.id.toString(),
		sort: (isAsc, left, right) => isAsc ? left.id - right.id : right.id - left.id,
		filter: (character, filter) => filterString(character.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'name',
		displayName: 'Name',
		widthPercent: 30,
		render: character => <DrodTextEditor text={character.name} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.finalValue, r.name.finalValue),
		filter: (character, filter) => filterString(character.name.finalValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldCharacters() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	return <>
		<SortableTable
			tableId="characters"
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={hold.characters.values()}
			pageSize={25} />
	</>
}