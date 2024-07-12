import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldEntrance } from "../../data/datatypes/HoldEntrance";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString, sortData } from "../../utils/SortUtils";
import HoldRefView from "../../components/viewHold/HoldRefVIew";
import SelectEditor from "../../components/viewHold/editables/SelectEditor";
import { Option } from "../../components/common/Select";
import { filterDataFormat, getDataFormatFilterOptions, getShowDescriptionName } from "../../data/Utils";
import SwapDataButton from "../../components/viewHold/preview/SwapDataButton";
import { DataRefViewByIdDynamic } from "../../components/viewHold/DataRefView";
import { DataFormat } from "../../data/DrodEnums";

const ShowDescriptionOptions: Option[] = [
	{id: '0', value: '0', label: getShowDescriptionName(0) },
	{id: '1', value: '1', label: getShowDescriptionName(1) },
	{id: '2', value: '2', label: getShowDescriptionName(2) },
];
const ShowDescriptionTransformer = (value: string) => parseInt(value);

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
		id: 'show-description',
		displayName: 'Show Description',
		widthPercent: 10,
		canHide: true,

		render: (entrance) => <SelectEditor value={entrance.showDescription} options={ShowDescriptionOptions} transformer={ShowDescriptionTransformer} />
	},
	{
		id: 'data',
		displayName: 'Data',
		widthPercent: 5,
		canHide: true,

		filterOptions: { optgroups: getDataFormatFilterOptions() },

		render: speech => <div className="is-flex is-gap-1 is-align-items-center">
			<SwapDataButton hold={speech.$hold} dataSource={speech.dataId} formats={[DataFormat.OGG, DataFormat.S3M, DataFormat.WAV]} />
			<DataRefViewByIdDynamic hold={speech.$hold} dataIdSource={speech.dataId} showName={true} />
		</div>,
		sort: (isAsc, l, r) => sortData(isAsc, l.$data, r.$data),
		filter: (speech, filter) => filterDataFormat(speech.$data?.details.finalValue.format, filter)
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