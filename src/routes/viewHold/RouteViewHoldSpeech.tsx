import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import { DataRefViewById } from "../../components/viewHold/DataRefView";
import HoldRefView from "../../components/viewHold/HoldRefVIew";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { filterDataFormat, getDataFormatFilterOptions } from "../../data/Utils";
import { HoldSpeech } from "../../data/datatypes/HoldSpeech";
import { holdRefToSortableString } from "../../data/references/holdRefToSortableString";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareRefs, sortCompareString, sortData } from "../../utils/SortUtils";
import { Mood, MoodIdToName } from "../../data/DrodEnums";
import { Option } from "../../components/common/Select";
import SelectEditor from "../../components/viewHold/editables/SelectEditor";

const MoodOptions: Option[] = [
	{ id: 0, value: Mood.Normal, label: MoodIdToName.get(Mood.Normal)! },
	{ id: 0, value: Mood.Aggressive, label: MoodIdToName.get(Mood.Aggressive)! },
	{ id: 0, value: Mood.Nervous, label: MoodIdToName.get(Mood.Nervous)! },
	{ id: 0, value: Mood.Strike, label: MoodIdToName.get(Mood.Strike)! },
	{ id: 0, value: Mood.Happy, label: MoodIdToName.get(Mood.Happy)! },
	{ id: 0, value: Mood.Dying, label: MoodIdToName.get(Mood.Dying)! },
	{ id: 0, value: Mood.Talking, label: MoodIdToName.get(Mood.Talking)! },
]

const Columns: SortableTableColumn<HoldSpeech>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		canHide: true,

		render: speech => speech.id.toString(),
		sort: (isAsc, left, right) => isAsc ? left.id - right.id : right.id - left.id,
		filter: (speech, filter) => filterString(speech.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'location',
		displayName: 'Location',
		widthPercent: 15,
		canHide: true,

		render: speech => <HoldRefView holdRef={speech.$location} /> ,
		sort: (isAsc, l, r) => sortCompareRefs(isAsc, l.$location, r.$location),
		filter: (speech, filter) => filterString(holdRefToSortableString(speech.$location), filter),
		filterDebounce: 500,
	},
	{
		id: 'mood',
		displayName: 'Mood',
		widthPercent: 5,
		canHide: true,

		render: speech => <SelectEditor value={speech.mood} options={MoodOptions} transformer={mood => parseInt(mood)} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.$mood, r.$mood),
		filter: (speech, filter) => filterString(speech.$mood, filter),
		filterDebounce: 500,
	},
	{
		id: 'speaker',
		displayName: 'Speaker',
		widthPercent: 5,
		canHide: true,

		render: speech => speech.$speaker,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.$speaker, r.$speaker),
		filter: (speech, filter) => filterString(speech.$speaker, filter),
		filterDebounce: 500,
	},
	{
		id: 'data',
		displayName: 'Data',
		widthPercent: 5,
		canHide: true,

		filterOptions: { optgroups: getDataFormatFilterOptions() },

		render: speech => <DataRefViewById hold={speech.$hold} dataId={speech.dataId} />,
		sort: (isAsc, l, r) => sortData(isAsc, l.$data, r.$data),
		filter: (speech, filter) => filterDataFormat(speech.$data?.details.finalValue.format, filter)
	},
	{
		id: 'text',
		displayName: 'Text',
		widthPercent: 30,
		render: speech => <DrodTextEditor text={speech.message} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.message.finalValue, r.message.finalValue),
		filter: (speech, filter) => filterString(speech.message.finalValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldSpeeches() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const speeches = hold.speeches.values();

	return <>
		<SortableTable
			tableId={`speeches::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={speeches}
			pageSize={25} />
	</>
}