import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { HoldVariable } from "../../../data/datatypes/HoldVariable";
import { renameVariable } from "../../../data/VariableUtils";
import VariableRenameModal from "./VariableRenameModal";

interface Props {
	variable: HoldVariable;
}
export default function VariableRenameButton({ variable }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const onRename = useCallback(
		(newName: string) => {
			if (!renameVariable(variable, newName)) {
				alert("Variable rename failed for unknown reasons.");
			}

			setIsOpen(false);
		},
		[variable],
	);

	const modal = isOpen ? (
		<VariableRenameModal
			variable={variable}
			onClose={() => setIsOpen(false)}
			onRename={onRename}
		/>
	) : null;

	return (
		<>
			<button
				type="button"
				className="button"
				onClick={() => setIsOpen(!isOpen)}
			>
				Rename
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
