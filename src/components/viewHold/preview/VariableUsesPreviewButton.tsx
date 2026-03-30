import { useState } from "react";
import { createPortal } from "react-dom";
import type { HoldVariable } from "../../../data/datatypes/HoldVariable";
import VariableUsesPreview from "./VariableUsesPreview";

interface Props {
	variable: HoldVariable;
}
export default function VariableUsesPreviewButton({ variable }: Props) {
	const { $uses } = variable;
	const [isOpen, setIsOpen] = useState(false);

	const modal = isOpen ? (
		<VariableUsesPreview variable={variable} onClose={() => setIsOpen(false)} />
	) : null;

	if ($uses.length === 0) {
		return <span className="is-muted">Unused</span>;
	}

	return (
		<>
			<button
				type="button"
				className="button"
				onClick={() => setIsOpen(!isOpen)}
			>
				{$uses.length} use{$uses.length !== 1 ? "s" : ""}
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
