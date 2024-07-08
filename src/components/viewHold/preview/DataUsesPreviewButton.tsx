import { useState } from "react";
import { createPortal } from "react-dom";
import { HoldData } from "../../../data/datatypes/HoldData";
import DataUsesPreview from "./DataUsesPreview";

interface Props {
	data: HoldData;
}
export default function DataUsesPreviewButton({data}: Props) {
	const { $uses } = data;
	const [isOpen, setIsOpen] = useState(false);

	const modal = isOpen
		? <DataUsesPreview data={data} onClose={() => setIsOpen(false)} />
		: null;

	if ($uses.length === 0) {
		return <span className="is-muted">Unused</span>;
	}

	return <>
		<button className="button" onClick={() => setIsOpen(!isOpen)}>{$uses.length} use{$uses.length !== 1 ? 's' : ''}</button>
		{createPortal(modal, document.body)}
	</>;
}