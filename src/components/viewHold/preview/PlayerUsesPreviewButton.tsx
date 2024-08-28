import { useState } from "react";
import { createPortal } from "react-dom";
import PlayerUsesPreview from "./PlayerUsesPreview";
import { HoldPlayer } from "../../../data/datatypes/HoldPlayer";

interface Props {
	player: HoldPlayer
}
export default function PlayerUsesPreviewButton({player}: Props) {
	const { $uses } = player;
	const [isOpen, setIsOpen] = useState(false);

	const modal = isOpen
		? <PlayerUsesPreview player={player} onClose={() => setIsOpen(false)} />
		: null;

	if ($uses.length === 0) {
		return <span className="is-muted">Unused</span>;
	}

	return <>
		<button className="button" onClick={() => setIsOpen(!isOpen)}>{$uses.length} use{$uses.length !== 1 ? 's' : ''}</button>
		{createPortal(modal, document.body)}
	</>;
}