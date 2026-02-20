import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { HoldVariable } from "../../../data/datatypes/HoldVariable";
import VariableRenameModal from "./VariableRenameModal";
import { renameVariable } from "../../../data/VariableUtils";

interface Props {
	variable: HoldVariable;
}
export default function VariableRenameButton({ variable }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const onRename = useCallback((newName: string) => {
		if (!renameVariable(variable, newName)) {
			alert("Variable rename failed for unknown reasons.");
		}

		setIsOpen(false);

	}, [variable, setIsOpen]);

	const modal = isOpen
		? <VariableRenameModal variable={variable} onClose={() => setIsOpen(false)} onRename={onRename} />
		: null;

	return <>
		<button className="button" onClick={() => setIsOpen(!isOpen)}>Rename</button>
		{createPortal(modal, document.body)}
	</>;
}