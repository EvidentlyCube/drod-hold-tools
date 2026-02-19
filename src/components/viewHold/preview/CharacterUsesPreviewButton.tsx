import { useState } from "react";
import { createPortal } from "react-dom";
import { HoldCharacter } from "../../../data/datatypes/HoldCharacter";
import CharacterUsesPreview from "./CharacterUsesPreview";

interface Props {
	character: HoldCharacter;
}
export default function CharacterUsesPreviewButton({ character }: Props) {
	const { $uses } = character;
	const [isOpen, setIsOpen] = useState(false);

	const modal = isOpen
		? <CharacterUsesPreview character={character} onClose={() => setIsOpen(false)} />
		: null;

	if ($uses.length === 0) {
		return <span className="is-muted">Unused</span>;
	}

	return <>
		<button className="button" onClick={() => setIsOpen(!isOpen)}>{$uses.length} use{$uses.length !== 1 ? 's' : ''}</button>
		{createPortal(modal, document.body)}
	</>;
}