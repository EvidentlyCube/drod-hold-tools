import { createPortal } from "react-dom";
import type { HoldPlayer } from "../../../data/datatypes/HoldPlayer";
import { useBoolState } from "../../../hooks/useBoolState";
import PlayerUsesPreview from "./PlayerUsesPreview";

interface Props {
	player: HoldPlayer;
}
export default function PlayerUsesPreviewButton({ player }: Props) {
	const { $uses } = player;
	const [isOpen, setOpen, setClose] = useBoolState(false);

	const modal = isOpen ? (
		<PlayerUsesPreview player={player} onClose={setClose} />
	) : null;

	if ($uses.length === 0) {
		return <span className="is-muted">Unused</span>;
	}

	return (
		<>
			<button type="button" className="button" onClick={setOpen}>
				{$uses.length} use{$uses.length !== 1 ? "s" : ""}
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
