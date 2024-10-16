import { useParams } from "react-router-dom";
import { HoldReaders } from "../../processor/HoldReaders";
import { Hold } from "../../data/datatypes/Hold";
import { ReactElement } from "react";
import SwapPlayerButton from "../../components/viewHold/preview/SwapPlayerButton";
import { PlayerRefViewByIdDynamic } from "../../components/viewHold/PlayerRefView";

type GetData = (hold: Hold) => ReactElement[] | ReactElement | string | number;

const DataPoints: Record<string, GetData> = {
	"Name": hold => hold.name.oldValue,
	"Author": hold => <div className="is-flex is-gap-1 is-align-items-center">
		<SwapPlayerButton hold={hold} playerSource={hold.playerId} />
		<PlayerRefViewByIdDynamic hold={hold} playerIdSource={hold.playerId} />
	</div>,
	"Description": hold => hold.descriptionMessage.oldValue,
	"Levels No.": hold => hold.levels.size,
	"Rooms No.": hold => hold.rooms.size,
	"Datas No.": hold => hold.datas.size,
	"Character No.": hold => hold.characters.size,
}

export default function RouteViewHoldSummary() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	return (
		<table className="table is-fullwidth is-hoverable is-striped">
			<tbody>
				{Object.entries(DataPoints).map(([name, getData]) => <DataRow key={name} hold={hold} name={name} getData={getData} />)}

			</tbody>
		</table>
	);
}

interface Props {
	name: string;
	getData: GetData;
	hold: Hold;
}
function DataRow({ name, getData, hold }: Props) {
	return <tr>
		<th>{name}</th>
		<td>{getData(hold)}</td>
	</tr>
}