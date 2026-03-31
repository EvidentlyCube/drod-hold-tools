import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { HoldVersionLimitationWarning } from "../../components/common/HoldVersionLimitationWarning";
import type { Option } from "../../components/common/Select";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import type { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import BulkManageIncorrectSpeechesButton from "../../components/viewHold/actions/BulkManageIncorrectSpeechesButton";
import { DataRefViewByIdDynamic } from "../../components/viewHold/DataRefView";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import SelectEditor from "../../components/viewHold/editables/SelectEditor";
import HoldRefView from "../../components/viewHold/HoldRefView";
import SwapDataButton from "../../components/viewHold/preview/SwapDataButton";
import { DataFormat, Mood } from "../../data/DrodEnums";
import { MoodToName } from "../../data/DrodEnumToName";
import type { HoldSpeech } from "../../data/datatypes/HoldSpeech";
import { holdRefToSortableString } from "../../data/references/holdRefToSortableString";
import { filterDataFormat, getDataFormatFilterOptions } from "../../data/Utils";
import { useSignalUpdatableValue } from "../../hooks/useSignalUpdatableValue";
import { HoldReaders } from "../../processor/HoldReaders";
import {
	filterString,
	sortCompareBool,
	sortCompareRefs,
	sortCompareString,
	sortData,
} from "../../utils/SortUtils";

const MoodOptions: Option[] = [
	{ id: 0, value: Mood.Normal, label: MoodToName.get(Mood.Normal) ?? "Error" },
	{
		id: 0,
		value: Mood.Aggressive,
		label: MoodToName.get(Mood.Aggressive) ?? "Error",
	},
	{
		id: 0,
		value: Mood.Nervous,
		label: MoodToName.get(Mood.Nervous) ?? "Error",
	},
	{ id: 0, value: Mood.Strike, label: MoodToName.get(Mood.Strike) ?? "Error" },
	{ id: 0, value: Mood.Happy, label: MoodToName.get(Mood.Happy) ?? "Error" },
	{ id: 0, value: Mood.Dying, label: MoodToName.get(Mood.Dying) ?? "Error" },
	{
		id: 0,
		value: Mood.Talking,
		label: MoodToName.get(Mood.Talking) ?? "Error",
	},
];

function DeleteCell({ speech }: { speech: HoldSpeech }) {
	const isDeleted = useSignalUpdatableValue(speech.$isDeleted, true);

	const onClick = useCallback(() => {
		speech.$isDeleted.newValue = !speech.$isDeleted.newValue;
	}, [speech]);

	if (speech.$canDelete) {
		if (isDeleted) {
			return (
				<button type="button" className="button is-danger" onClick={onClick}>
					Deleting!
				</button>
			);
		} else {
			return (
				<button type="button" className="button is-info" onClick={onClick}>
					Delete
				</button>
			);
		}
	} else {
		return null;
	}
}

const transformMood = (mood: string) => {
	const result = parseInt(mood, 10);

	return result in Mood ? result : Mood.Normal;
};
const Columns: SortableTableColumn<HoldSpeech>[] = [
	{
		id: "id",
		displayName: "ID",
		widthPercent: 5,
		canHide: true,

		render: speech => speech.id.toString(),
		sort: (isAsc, left, right) =>
			isAsc ? left.id - right.id : right.id - left.id,
		filter: (speech, filter) => filterString(speech.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: "location",
		displayName: "Location",
		widthPercent: 15,
		canHide: true,

		render: speech => <HoldRefView holdRef={speech.$location} />,
		sort: (isAsc, l, r) => sortCompareRefs(isAsc, l.$location, r.$location),
		filter: (speech, filter) =>
			filterString(holdRefToSortableString(speech.$location), filter),
		filterDebounce: 500,
	},
	{
		id: "mood",
		displayName: "Mood",
		widthPercent: 5,
		canHide: true,

		render: speech => (
			<SelectEditor
				value={speech.mood}
				options={MoodOptions}
				transformer={transformMood}
			/>
		),
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.$mood, r.$mood),
		filter: (speech, filter) => filterString(speech.$mood, filter),
		filterDebounce: 500,
	},
	{
		id: "speaker",
		displayName: "Speaker",
		widthPercent: 5,
		canHide: true,

		render: speech => speech.$speaker,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.$speaker, r.$speaker),
		filter: (speech, filter) => filterString(speech.$speaker, filter),
		filterDebounce: 500,
	},
	{
		id: "data",
		displayName: "Data",
		widthPercent: 5,
		canHide: true,

		filterOptions: { optgroups: getDataFormatFilterOptions() },

		render: speech => (
			<div className="is-flex is-gap-1 is-align-items-center">
				<SwapDataButton
					hold={speech.$hold}
					dataSource={speech.dataId}
					formats={[DataFormat.OGG, DataFormat.S3M, DataFormat.WAV]}
				/>
				<DataRefViewByIdDynamic
					hold={speech.$hold}
					dataIdSource={speech.dataId}
					showName={true}
				/>
			</div>
		),
		sort: (isAsc, l, r) => sortData(isAsc, l.$data, r.$data),
		filter: (speech, filter) =>
			filterDataFormat(speech.$data?.details.newValue.format, filter),
	},
	{
		id: "text",
		displayName: "Text",
		widthPercent: 30,
		render: speech => <DrodTextEditor text={speech.message} />,
		sort: (isAsc, l, r) =>
			sortCompareString(isAsc, l.message.newValue, r.message.newValue),
		filter: (speech, filter) => filterString(speech.message.newValue, filter),
		filterDebounce: 500,
	},
	{
		id: "delete",
		displayName: "Delete",
		widthPercent: 5,
		render: speech => <DeleteCell speech={speech} />,
		sort: (isAsc, l, r) =>
			sortCompareBool(isAsc, l.$isDeleted.newValue, r.$isDeleted.newValue),
	},
];

export default function RouteViewHoldSpeeches() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	if (!hold.version.scripting.isSupported) {
		return (
			<HoldVersionLimitationWarning
				warnings={["Speech command was implemented in Journey to Rooted Hold"]}
			/>
		);
	}

	const speeches = hold.speeches.values();

	return (
		<>
			<div className="buttons section p-4 mb-0">
				<strong>Actions:</strong>
				<BulkManageIncorrectSpeechesButton hold={hold} />
			</div>
			<SortableTable
				tableId={`speeches::${hold.$holdReaderId}`}
				className="table is-fullwidth is-hoverable is-striped is-middle"
				columns={Columns}
				rows={speeches}
				pageSize={25}
			/>
		</>
	);
}
