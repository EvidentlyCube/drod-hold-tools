import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DataRefView from "../../components/viewHold/DataRefView";
import { filterDataFormat, getDataFormatFilterOptions } from "../../data/Utils";
import { HoldData } from "../../data/datatypes/HoldData";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString, sortData } from "../../utils/SortUtils";
import { formatBytes } from "../../utils/Language";
import { createPortal } from "react-dom";
import { useState } from "react";
import DataPreview from "../../components/viewHold/DataPreview";
import Modal from "../../components/common/Modal";

interface PreviewProps {
	data: HoldData;
}
function PreviewCell({data}: PreviewProps) {
	const [isOpen, setIsOpen] = useState(false);

	const modal = !isOpen
	? null
	: <Modal onClose={() => setIsOpen(false)}>
		<DataPreview data={data} />
	</Modal>

	return <>
		<button className="button" onClick={() => setIsOpen(!isOpen)}>Preview</button>
		{createPortal(modal, document.body)}
	</>;
}
const Columns: SortableTableColumn<HoldData>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		canHide: true,

		render: data => data.id.toString(),
		sort: (isAsc, left, right) => isAsc ? left.id - right.id : right.id - left.id,
		filter: (data, filter) => filterString(data.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'format',
		displayName: 'Format',
		widthPercent: 5,
		canHide: true,

		filterOptions: { optgroups: getDataFormatFilterOptions() },

		render: data => <DataRefView hold={data.$hold} dataId={data.id} />,
		sort: (isAsc, l, r) => sortData(isAsc, l, r),
		filter: (data, filter) => filterDataFormat(data.format, filter)
	},
	{
		id: 'size',
		displayName: 'Size',
		widthPercent: 5,
		canHide: true,
		className: 'has-text-right is-family-monospace',

		render: data => formatBytes(data.$size),
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.$size, r.$size)
	},
	{
		id: 'name',
		displayName: 'Name',
		widthPercent: 15,
		canHide: true,

		render: data => data.name.finalText,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.finalText, r.name.finalText),
		filter: (data, filter) => filterString(data.name.finalText, filter)
	},
	{
		id: 'preview',
		displayName: 'Preview',
		widthPercent: 10,

		render: data => <PreviewCell data={data} />,
	},
];

export default function RouteViewHoldData() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const datas = hold.datas.values();

	return <>
		<SortableTable
			tableId="data"
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={datas}
			pageSize={25} />
	</>
}