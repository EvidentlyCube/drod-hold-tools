import { NavLink } from "react-router-dom";
import { useSignalArray } from "../../hooks/useSignalArray";
import { HoldReader } from "../../processor/HoldReader";
import { HoldReaders } from "../../processor/HoldReaderManager";
import { useSignalString } from "../../hooks/useSignalString";


export default function NavHoldsList() {
	const holds = useSignalArray(HoldReaders.holdReaders);

	return (<>
		{holds.map(holdReader => <NavHold key={holdReader.id} holdReader={holdReader} />)}
	</>)
}

interface NavHoldProps {
	holdReader: HoldReader;
}
function NavHold({ holdReader }: NavHoldProps) {
	const name = useSignalString(holdReader.name);

	const id = holdReader.id;
	return <NavLink className="navbar-item" to={`/hold/${id}`}>
		{name}
	</NavLink>;
}