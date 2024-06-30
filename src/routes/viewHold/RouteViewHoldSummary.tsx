import { useParams } from "react-router-dom";
import { HoldReaders } from "../../processor/HoldReaderManager";
import { Hold } from "../../data/datatypes/Hold";

type GetData = (hold: Hold) => string|number;

const DataPoints: Record<string, GetData> = {
	"Name": hold => hold.name.text,
	"Description": hold => hold.descriptionMessage.text,
	"Levels No.": hold => Object.keys(hold.levels).length,
	"Rooms No.": hold => Object.keys(hold.rooms).length,
	"Datas No.": hold => Object.keys(hold.data).length,
	"Character No.": hold => Object.keys(hold.characters).length
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
		<td>{getData(hold)}</td>
	</tr>
}