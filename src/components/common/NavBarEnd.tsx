import { useSignalValue } from "../../hooks/useSignalValue";
import { HoldIndexedStorage } from "../../processor/HoldIndexedStorage";
import AddHoldNavButton from "./AddHoldNavButton";

export default function NavBarEnd() {
	const isBusy = useSignalValue(HoldIndexedStorage.isBusy);

	return (
		<div className="navbar-end">
			<div className="navbar-item">
				<i className={isBusy ? "fa-solid fa-floppy-disk save-icon busy" : "fa-solid fa-floppy-disk save-icon"}/>
			</div>
			<AddHoldNavButton />
		</div>
	);
}
