import { useParams } from "react-router-dom";
import SortableTable, { Column } from "../../components/common/SortableTable";
import { HoldReaders } from "../../processor/HoldReaderManager";
import { ChangeViewItem, changeToViewItem } from "./ChangeViewItem";


const Columns: Column<ChangeViewItem>[] = [
	{
		id: 'type',
		displayName: 'Type',
		widthPercent: 10,
		render: change => change.type
	},
	{
		id: 'location',
		displayName: 'Location',
		widthPercent: 10,
		render: change => change.location
	},
	{
		id: 'before',
		displayName: 'Before',
		widthPercent: 10,
		render: change => change.before
	},
	{
		id: 'after',
		displayName: 'After',
		widthPercent: 10,
		render: change => change.after
	},
];

export default function RouteViewHoldChanges() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const changes = hold.$changes.list.values().map(change => changeToViewItem(change, hold));

	return <SortableTable
		className="table is-fullwidth is-hoverable is-striped is-middle"
		columns={Columns}
		rows={changes}
		pageSize={25} />
}