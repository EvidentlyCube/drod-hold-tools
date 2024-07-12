import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldLevel } from "../../data/datatypes/HoldLevel";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString } from "../../utils/SortUtils";

const Columns: SortableTableColumn<HoldLevel>[] = [
	{
		id: 'index',
		displayName: 'Index',
		widthPercent: 5,
		canHide: true,

		render: level => level.orderIndex.toString(),
		sort: (isAsc, left, right) => sortCompareNumber(isAsc, left.orderIndex, right.orderIndex),
		filter: (level, filter) => filterString(level.orderIndex.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		canHide: true,

		render: level => level.id.toString(),
		sort: (isAsc, left, right) => sortCompareNumber(isAsc, left.id, right.id),
		filter: (level, filter) => filterString(level.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'rooms',
		displayName: 'Rooms',
		widthPercent: 5,
		canHide: true,

		render: level => level.$rooms.length.toString(),
		sort: (isAsc, left, right) => sortCompareNumber(isAsc, left.$rooms.length, right.$rooms.length),
		filter: (level, filter) => filterString(level.$rooms.length.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'name',
		displayName: 'Name',
		widthPercent: 30,
		render: level => <DrodTextEditor text={level.name} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.newValue, r.name.newValue),
		filter: (level, filter) => filterString(level.name.newValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldLevels() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const levels = hold.levels.values();

	return <>
		<SortableTable
			tableId={`levels::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={levels}
			pageSize={25} />
	</>
}