import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import HoldRefView from "../../components/viewHold/HoldRefView";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldScroll } from "../../data/datatypes/HoldRoom";
import { getScrollRef } from "../../data/references/HoldReferenceUtils";
import { holdRefToSortableString } from "../../data/references/holdRefToSortableString";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareRefs, sortCompareString } from "../../utils/SortUtils";

const Columns: SortableTableColumn<HoldScroll>[] = [
	{
		id: 'location',
		displayName: 'Location',
		widthPercent: 10,
		canHide: true,

		render: scroll => <HoldRefView holdRef={getScrollRef(scroll)} />,
		sort: (isAsc, left, right) => sortCompareRefs(isAsc, left.$scrollRef, right.$scrollRef),
		filter: (scroll, filter) => filterString(holdRefToSortableString(scroll.$scrollRef), filter),
		filterDebounce: 500,
	},
	{
		id: 'text',
		displayName: 'Scroll Text',
		widthPercent: 30,
		render: scroll => <DrodTextEditor text={scroll.message} tag="textarea" />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.message.newValue, r.message.newValue),
		filter: (scroll, filter) => filterString(scroll.message.newValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldScrolls() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	return <>
		<SortableTable
			tableId={`scrolls::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={hold.$scrolls}
			pageSize={25} />
	</>
}