import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import PlayerUsesPreviewButton from "../../components/viewHold/preview/PlayerUsesPreviewButton";
import { HoldPlayer } from "../../data/datatypes/HoldPlayer";
import { useSignalOrderedMapValues } from "../../hooks/useSignalOrderedMapValues";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString } from "../../utils/SortUtils";
import { useSignalUpdatableValue } from "../../hooks/useSignalUpdatableValue";

function DeleteCell({player}: {player: HoldPlayer}) {
	const isDeleted = useSignalUpdatableValue(player.$isDeleted, true);

	const onClick = () => {
		player.$isDeleted.newValue = !player.$isDeleted.newValue;
	};

	if (isDeleted) {
		return <button
			className="button is-danger is-outlined"
			onClick={onClick}
		>Restore</button>
	} else if (player.$uses.length > 0) {
		return <em>Cannot delete used player</em>;

	} else {
		return <button
			className="button is-danger"
			onClick={onClick}
		>Delete</button>
	}
}

const Columns: SortableTableColumn<HoldPlayer>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		render: player => player.id,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.id, r.id),
		filter: (player, filter) => filterString(player.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'original_name',
		displayName: 'Original Name (GUID)',
		widthPercent: 20,
		render: player => player.gidOriginalName,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.gidOriginalName, r.gidOriginalName),
		filter: (player, filter) => filterString(player.gidOriginalName, filter),
		filterDebounce: 500,
	},
	{
		id: 'name',
		displayName: 'Player Name',
		widthPercent: 20,
		render: player => <DrodTextEditor text={player.name} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.newValue, r.name.newValue),
		filter: (player, filter) => filterString(player.name.newValue, filter),
		filterDebounce: 500,
	},
	{
		id: 'uses',
		displayName: 'Uses',
		widthPercent: 5,

		render: player => <PlayerUsesPreviewButton player={player} />,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.$uses.length, r.$uses.length),
	},
	{
		id: 'delete',
		displayName: 'Delete',
		widthPercent: 5,

		render: player => <DeleteCell player={player} />,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.$uses.length, r.$uses.length),
	},
];

export default function RouteViewHoldPlayers() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);
	const players = useSignalOrderedMapValues(hold.players);

	return <>
		<div className="buttons section p-4 mb-0">
			<strong>Actions:</strong>
			<button
				className="button is-primary"
				onClick={() => hold.addNewPlayer()}
			>Add New Player</button>
		</div>
		<SortableTable
			tableId={`players::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={players}
			pageSize={25} />
	</>
}