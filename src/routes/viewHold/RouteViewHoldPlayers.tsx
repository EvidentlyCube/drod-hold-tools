import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldPlayer } from "../../data/datatypes/HoldPlayer";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString } from "../../utils/SortUtils";
import PlayerUsesPreviewButton from "../../components/viewHold/preview/PlayerUsesPreviewButton";

const Columns: SortableTableColumn<HoldPlayer>[] = [
	{
		id: 'original_name',
		displayName: 'Original Name (GUID)',
		widthPercent: 30,
		render: player => player.gidOriginalName.newValue,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.gidOriginalName.newValue, r.gidOriginalName.newValue),
		filter: (scroll, filter) => filterString(scroll.gidOriginalName.newValue, filter),
		filterDebounce: 500,
	},
	{
		id: 'name',
		displayName: 'Player Name',
		widthPercent: 30,
		render: player => <DrodTextEditor text={player.name} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.newValue, r.name.newValue),
		filter: (scroll, filter) => filterString(scroll.name.newValue, filter),
		filterDebounce: 500,
	},
	{
		id: 'uses',
		displayName: 'Uses',
		widthPercent: 5,

		render: player => <PlayerUsesPreviewButton player={player} />,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.$uses.length, r.$uses.length),
	},
];

export default function RouteViewHoldPlayers() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	const players = hold.players.values();

	return <>
		<SortableTable
			tableId={`scrolls::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={players}
			pageSize={25} />
	</>
}