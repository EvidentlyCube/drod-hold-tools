import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldEntrance } from "../../data/datatypes/HoldEntrance";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString, sortData } from "../../utils/SortUtils";
import HoldRefView from "../../components/viewHold/HoldRefView";
import SelectEditor from "../../components/viewHold/editables/SelectEditor";
import { Option } from "../../components/common/Select";
import { filterDataFormat, getDataFormatFilterOptions, getShowDescriptionName } from "../../data/Utils";
import SwapDataButton from "../../components/viewHold/preview/SwapDataButton";
import { DataRefViewByIdDynamic } from "../../components/viewHold/DataRefView";
import { DataFormat } from "../../data/DrodEnums";
import { filterInline } from "../../utils/ArrayUtils";
import { HoldVersionLimitationWarning } from "../../components/common/HoldVersionLimitationWarning";

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
		sort: (isAsc, left, right) => sortCompareString(isAsc, left.$level.name.newValue, right.$level.name.newValue),
		filter: (entrance, filter) => filterString(entrance.$level.name.newValue, filter),
		filterDebounce: 500,
	},
	{
		id: 'show-description',
		displayName: 'Show Description',
		widthPercent: 10,
		canHide: true,

		render: (entrance) => <SelectEditor
			value={entrance.showDescription}
			options={entrance.$hold.version.entrance.showDescriptionOptions}
			transformer={ShowDescriptionTransformer}
		/>
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
		filter: (speech, filter) => filterDataFormat(speech.$data?.details.newValue.format, filter)
	},
	{
		id: 'text',
		displayName: 'Entrance Text',
		widthPercent: 30,
		render: entrance => <DrodTextEditor text={entrance.description} tag="textarea" />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.description.newValue, r.description.newValue),
		filter: (entrance, filter) => filterString(entrance.description.newValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldEntrances() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const columns = Columns.concat();
	const warnings: string[] = [];

	if (hold.version.entrance.isStoredInLevelAttributes) {
		warnings.push("Architect's Edition only supported one entrance per level.")
	}

	if (!hold.version.entrance.canAddSound) {
		filterInline(columns, c => c.id === 'data');
		warnings.push('Entrance sound not supported; Data column removed.')
	}

	if (!hold.version.entrance.canHideDescription) {
		filterInline(columns, c => c.id === 'show-description');
		warnings.push('Controlling whether to show description not supported; Show Description column removed.')

	} else if (!hold.version.entrance.canShowDescriptionOnce) {
		warnings.push('Cannot display entrance description once; option removed.')
	}


	return <>
		<HoldVersionLimitationWarning warnings={warnings} />
		<SortableTable
			tableId={`entrances::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={columns}
			rows={hold.entrances.values()}
			pageSize={25} />
	</>
}