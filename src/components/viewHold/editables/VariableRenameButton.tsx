import { useCallback } from "react";
import { createPortal } from "react-dom";
import type { HoldVariable } from "../../../data/datatypes/HoldVariable";
import { renameVariable } from "../../../data/VariableUtils";
import { useBoolState } from "../../../hooks/useBoolState";
import VariableRenameModal from "./VariableRenameModal";

interface Props {
	variable: HoldVariable;
}
export default function VariableRenameButton({ variable }: Props) {
	const [isOpen, setOpen, setClose] = useBoolState(false);

	const onRename = useCallback(
		(newName: string) => {
			if (!renameVariable(variable, newName)) {
				alert("Variable rename failed for unknown reasons.");
			}

			setClose();
		},
		[variable, setClose],
	);

	const modal = isOpen ? (
		<VariableRenameModal
			variable={variable}
			onClose={setClose}
			onRename={onRename}
		/>
	) : null;

	return (
		<>
			<button type="button" className="button" onClick={setOpen}>
				Rename
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
