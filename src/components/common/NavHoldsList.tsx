import { NavLink } from "react-router-dom";
import { useSignalArray } from "../../hooks/useSignalArray";
import { useSignalValue } from "../../hooks/useSignalValue";
import { HoldIndexedStorage } from "../../processor/HoldIndexedStorage";
import { type HoldReader, HoldReaders } from "../../processor/HoldReaders";

export default function NavHoldsList() {
	const isLoading = useSignalValue(HoldIndexedStorage.isInitializing);
	const holds = useSignalArray(HoldReaders.holdReaders);

	return (
		<>
			{holds.map(holdReader => (
				<NavHold key={holdReader.id} holdReader={holdReader} />
			))}
			{isLoading && (
				<div className="navbar-item">
					<button type="button" className="button is-loading is-ghost"></button>
				</div>
			)}
		</>
	);
}

interface NavHoldProps {
	holdReader: HoldReader;
}
function NavHold({ holdReader }: NavHoldProps) {
	const name = useSignalValue(holdReader.name);
	const isBusy = useSignalValue(holdReader.isBusy);

	const id = holdReader.id;
	const className = ["navbar-item", isBusy ? "shimmer-loader" : ""].join(" ");
	return (
		<NavLink className={className} to={`/hold/${id}`}>
			{name}
		</NavLink>
	);
}
