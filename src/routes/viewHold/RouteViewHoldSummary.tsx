import { useParams } from "react-router-dom";
import { HoldReaders } from "../../processor/HoldReaderManager";
import { Hold } from "../../data/datatypes/Hold";

type GetData = (hold: Hold) => string|number;

const DataPoints: Record<string, GetData> = {
	"Name": hold => hold.name.text,
	"Description": hold => hold.descriptionMessage.text,
	"Levels No.": hold => hold.levels.size,
	"Rooms No.": hold => hold.rooms.size,
	"Datas No.": hold => hold.data.size,
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
function DataRow({name, getData, hold}: Props) {
	return <tr>
		<th>{name}</th>
		<td>{getData(hold).toString()}</td>
	</tr>
}