import { ChangeEvent, useCallback } from "react";
import { useParams } from "react-router-dom";
import SortableTable, { Column } from "../../components/common/SortableTable";
import { HoldSpeech } from "../../data/datatypes/HoldSpeech";
import { useSignalDrodText } from "../../hooks/useSignalDrodText";
import { HoldReaders } from "../../processor/HoldReaderManager";

function EditCell({speech}: {speech: HoldSpeech}) {
	const newText = useSignalDrodText(speech.message);

	const toggleText = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (newText === undefined) {
			speech.message.newText = speech.message.text;
		} else {
			speech.message.newText = undefined;
		}
	}, [speech, newText]);

	return <input type="checkbox" checked={newText !== undefined} onChange={toggleText} />;
}
function NewTextCell({speech}: {speech: HoldSpeech}) {
	const newText = useSignalDrodText(speech.message);

	const typeText = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		speech.message.newText = e.target.value;
	}, [speech]);

	return <input className="input" type="text" value={newText ?? ""} onInput={typeText} disabled={newText === undefined} />;
}

const Columns: Column<HoldSpeech>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		render: speech => speech.id.toString(),
		sort: (isAsc, left, right) => isAsc ? left.id - right.id : right.id - left.id
	},
	{
		id: 'location',
		displayName: 'Location',
		widthPercent: 5,

		render: speech => "<unknown>",
	},
	{
		id: 'mood',
		displayName: 'Mood',
		widthPercent: 5,

		render: speech => speech.mood,
	},
	{
		id: 'character',
		displayName: 'Character',
		widthPercent: 5,

		render: speech => speech.character,
		sort: (isAsc, l, r) => isAsc
			? l.character - r.character
			: r.character - l.character
	},
	{
		id: 'data',
		displayName: 'Data',
		widthPercent: 5,

		render: speech => speech.dataId ?? "<none>",
		sort: (isAsc, l, r) => isAsc
			? (l.dataId ?? 0) - (r.dataId ?? 0)
			: (r.dataId ?? 0) - (l.dataId ?? 0)
	},
	{
		id: 'text',
		displayName: 'Text',
		widthPercent: 35,
		render: speech => speech.message.text,
		sort: (isAsc, l, r) => isAsc
			? l.message.text.localeCompare(r.message.text)
			: r.message.text.localeCompare(l.message.text)
	},
	{
		id: 'edit',
		displayName: 'Edit',
		widthPercent: 5,
		render: speech => <EditCell speech={speech} />
	},
	{
		id: 'new-text',
		displayName: 'New Text',
		widthPercent: 35,
		render: speech => <NewTextCell speech={speech} />,
		sort: (isAsc, l, r) => {
			if (l.message.newText && r.message.newText) {
				return isAsc
					? l.message.newText.localeCompare(r.message.newText)
					: r.message.newText.localeCompare(l.message.newText)
			} else if (l.message.newText) {
				return isAsc ? 1 : -1;
			} else if (r.message.newText) {
				return isAsc ? -1 : 1;
			} else {
				return 0;
			}
		}
	}
];

export default function RouteViewHoldSpeeches() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const speeches = hold.speeches.values();

	return <SortableTable
		className="table is-fullwidth is-hoverable is-striped is-middle"
		columns={Columns}
		rows={speeches}
		pageSize={25} />
}