import { NavLink } from "react-router-dom";
import { useSignalArray } from "../../hooks/useSignalArray";
import { HoldReader } from "../../processor/HoldReader";
import { HoldReaders } from "../../processor/HoldReaderManager";
import { useSignalValue } from "../../hooks/useSignalValue";
import { HoldIndexedStorage } from "../../processor/HoldIndexedStorage";

export default function NavHoldsList() {
	const isLoading = useSignalValue(HoldIndexedStorage.isInitializing);
	const holds = useSignalArray(HoldReaders.holdReaders);

	return (
		<>
			{holds.map((holdReader) => (
				<NavHold key={holdReader.id} holdReader={holdReader} />
			))}
			{isLoading && <div className="navbar-item"><button className="button is-loading is-ghost"></button></div>}
		</>
	);
}

interface NavHoldProps {
	holdReader: HoldReader;
}
function NavHold({ holdReader }: NavHoldProps) {
	const name = useSignalValue(holdReader.name);

	const id = holdReader.id;
	return (
		<NavLink className="navbar-item" to={`/hold/${id}`}>
			{name}
		</NavLink>
	);
}
