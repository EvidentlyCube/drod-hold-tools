import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DataRefView from "../../components/viewHold/DataRefView";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import PreviewButton from "../../components/viewHold/preview/PreviewButton";
import { canPreviewData, filterDataFormat, getBase64DecodedLength, getDataFormatFilterOptions } from "../../data/Utils";
import { HoldData } from "../../data/datatypes/HoldData";
import { useSignalUpdatableValue } from "../../hooks/useSignalUpdatableValue";
import { HoldReaders } from "../../processor/HoldReaders";
import { formatBytes } from "../../utils/Language";
import { filterString, sortCompareNumber, sortCompareString, sortCompareWithUndefined, sortData } from "../../utils/SortUtils";
import ReplaceButton from "../../components/viewHold/preview/ReplaceButton";
import DataUsesPreviewButton from "../../components/viewHold/preview/DataUsesPreviewButton";
import { useCallback } from "react";

function HoldDataSize({ data }: { data: HoldData }) {
	const { rawEncodedData } = useSignalUpdatableValue(data.details, true);

	return <span>
		{formatBytes(getBase64DecodedLength(rawEncodedData))}
	</span>;
}

function PreviewCell({ data }: { data: HoldData}) {
	const [oldDetails, isChanged, newDetails] = useSignalUpdatableValue(data.details);

	const onUndoChanges = useCallback(() => {
		data.details.unset();
	}, [data])

	if (!canPreviewData(newDetails)) {
		return <span className="is-muted">Cannot preview </span>

	} else if (isChanged) {
		return <>
			<PreviewButton data={data} details={oldDetails} text="Original" />
			{" "}<PreviewButton data={data} details={newDetails} text="Updated" />
			{" "}<button className="button" title="Undo changes" onClick={onUndoChanges}>
				<span className="icon">
					<i className="fas fa-xmark" />
				</span>
			</button>
		</>
	} else {
		return <PreviewButton data={data} details={oldDetails} text="Preview" />;
	}
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

		render: data => <DataRefView data={data} />,
		sort: (isAsc, l, r) => sortData(isAsc, l, r),
		filter: (data, filter) => filterDataFormat(data.details.newValue.format, filter)
	},
	{
		id: 'size',
		displayName: 'Size',
		widthPercent: 5,
		canHide: true,
		className: 'has-text-right is-family-monospace',

		render: data => <HoldDataSize data={ data } />,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.$size, r.$size)
	},
	{
		id: 'name',
		displayName: 'Name',
		widthPercent: 15,
		canHide: true,

		render: data => <DrodTextEditor text={data.name} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.newValue, r.name.newValue),
		filter: (data, filter) => filterString(data.name.newValue, filter)
	},
	{
		id: 'preview',
		displayName: 'Preview',
		widthPercent: 10,

		render: data => <PreviewCell data={ data } />,
		sort: (isAsc, l, r) => sortCompareWithUndefined(isAsc, l.details.newValue, r.details.newValue),
	},
	{
		id: 'replace',
		displayName: 'Replace',
		widthPercent: 10,

		render: data => {
			if (!canPreviewData(data.details.newValue)) {
				return <span className="is-muted">Cannot replace</span>
			} else {
				return <ReplaceButton data={data} />;
			}
		}
	},
	{
		id: 'uses',
		displayName: 'Uses',
		widthPercent: 5,

		render: data => <DataUsesPreviewButton data={data} />,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.$uses.length, r.$uses.length),
	},
];

export default function RouteViewHoldDatas() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const datas = hold.datas.values();

	return <>
		<SortableTable
			tableId={`data::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={datas}
			pageSize={25} />
	</>
}