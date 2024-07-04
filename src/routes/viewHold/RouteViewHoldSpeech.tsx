import { ChangeEvent, useCallback } from "react";
import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DataRefView from "../../components/viewHold/DataRefView";
import HoldRefView from "../../components/viewHold/HoldRefVIew";
import { HoldSpeech } from "../../data/datatypes/HoldSpeech";
import { holdRefToSortableString } from "../../data/references/holdRefToSortableString";
import { useSignalDrodText } from "../../hooks/useSignalDrodText";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareRefs, sortCompareString, sortCompareWithUndefined, sortData } from "../../utils/SortUtils";
import { filterDataFormat, getDataFormatFilterOptions } from "../../data/Utils";

function EditCell({speech}: {speech: HoldSpeech}) {
	const [, newText] = useSignalDrodText(speech.message);

	const toggleText = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (newText === undefined) {
			speech.message.newText = speech.message.oldText;
		} else {
			speech.message.newText = undefined;
		}
	}, [speech, newText]);

	return <input type="checkbox" checked={newText !== undefined} onChange={toggleText} />;
}
function NewTextCell({speech}: {speech: HoldSpeech}) {
	const [oldText, newText] = useSignalDrodText(speech.message);

	const typeText = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		speech.message.newText = e.target.value;
	}, [speech]);

	if (newText === undefined) {
		return <>{oldText}</>;
	}

	return <input
		className="input"
		type="text"
		value={newText}
		onInput={typeText} />;
}

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

		render: speech => speech.$mood,
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

		render: speech => <DataRefView hold={speech.$hold} dataId={speech.dataId} />,
		sort: (isAsc, l, r) => sortData(isAsc, l.$data, r.$data),
		filter: (speech, filter) => filterDataFormat(speech.$data?.format, filter)
	},
	{
		id: 'edit',
		displayName: 'Edit',
		widthPercent: 5,
		render: speech => <EditCell speech={speech} />,
		sort: (isAsc, l, r) => sortCompareWithUndefined(isAsc, l.message.newText, r.message.newText)
	},
	{
		id: 'text',
		displayName: 'Text',
		widthPercent: 30,
		render: speech => <NewTextCell speech={speech} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.message.finalText, r.message.finalText),
		filter: (speech, filter) => filterString(speech.message.finalText, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldSpeeches() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const speeches = hold.speeches.values();

	return <>
		<SortableTable
			tableId="speeches"
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={speeches}
			pageSize={25} />
	</>
}