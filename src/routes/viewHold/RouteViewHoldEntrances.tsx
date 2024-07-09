import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldEntrance } from "../../data/datatypes/HoldEntrance";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString } from "../../utils/SortUtils";
import HoldRefView from "../../components/viewHold/HoldRefVIew";

const Columns: SortableTableColumn<HoldEntrance>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		canHide: true,

		render: entrance => entrance.id.toString(),
		sort: (isAsc, left, right) => sortCompareNumber(isAsc, left.id, right.id),
		filter: (entrance, filter) => filterString(entrance.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'level',
		displayName: 'Level',
		widthPercent: 10,
		canHide: true,

		render: entrance => <HoldRefView holdRef={entrance.$roomRef} />,
		sort: (isAsc, left, right) => sortCompareString(isAsc, left.$level.name.finalValue, right.$level.name.finalValue),
		filter: (entrance, filter) => filterString(entrance.$level.name.finalValue, filter),
		filterDebounce: 500,
	},
	{
		id: 'text',
		displayName: 'Entrance Text',
		widthPercent: 30,
		render: entrance => <DrodTextEditor text={entrance.description} tag="textarea" />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.description.finalValue, r.description.finalValue),
		filter: (entrance, filter) => filterString(entrance.description.finalValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldEntrances() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	return <>
		<SortableTable
			tableId={`entrances::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={hold.entrances.values()}
			pageSize={25} />
	</>
}