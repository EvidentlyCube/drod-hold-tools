import { createPortal } from "react-dom";
import type { HoldCharacter } from "../../../data/datatypes/HoldCharacter";
import { useBoolState } from "../../../hooks/useBoolState";
import CharacterUsesPreview from "./CharacterUsesPreview";

interface Props {
	character: HoldCharacter;
}
export default function CharacterUsesPreviewButton({ character }: Props) {
	const { $uses } = character;
	const [isOpen, setOpen, setClose] = useBoolState(false);

	const modal = isOpen ? (
		<CharacterUsesPreview character={character} onClose={setClose} />
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
