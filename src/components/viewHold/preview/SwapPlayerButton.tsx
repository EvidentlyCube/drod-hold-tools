import { useCallback } from "react";
import { createPortal } from "react-dom";
import type { Hold } from "../../../data/datatypes/Hold";
import { useBoolState } from "../../../hooks/useBoolState";
import { useSignalUpdatableValue } from "../../../hooks/useSignalUpdatableValue";
import type { SignalUpdatableValue } from "../../../utils/SignalUpdatableValue";
import SelectPlayerModal from "./SelectPlayerModal";

interface Props {
	hold: Hold;
	playerSource: SignalUpdatableValue<number>;
}
export default function SwapPlayerButton({ hold, playerSource }: Props) {
	const isChanged = useSignalUpdatableValue(playerSource)[1];
	const [isOpen, setOpen, setClose] = useBoolState(false);

	const onSelect = useCallback(
		(playerId: number) => {
			if (playerId === playerSource.oldValue) {
				playerSource.unset();
			} else {
				playerSource.set(true, playerId);
			}
			setClose();
		},
		[playerSource, setClose],
	);
	const onUnset = useCallback(() => {
		playerSource.unset();
		setClose();
	}, [playerSource, setClose]);

	const modal = isOpen ? (
		<SelectPlayerModal hold={hold} onClose={setClose} onSelect={onSelect} />
	) : null;

	return (
		<>
			<button
				type="button"
				className={`button is-small is-tooltip`}
				onClick={setOpen}
				title="Change "
			>
				<div className="icon">
					<i className="fas fa-arrows-rotate" />
				</div>
			</button>
			<button
				type="button"
				className={`button is-small is-warning ${!isChanged ? "is-hidden" : ""}`}
				onClick={onUnset}
				title="Undo change"
			>
				<div className="icon">
					<i className="fas fa-rotate-left" />
				</div>
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
