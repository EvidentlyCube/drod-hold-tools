import { useState } from "react";
import DataPreview from "../DataPreview";
import { HoldData, HoldDataDetails } from "../../../data/datatypes/HoldData";
import { createPortal } from "react-dom";

interface Props {
	data: HoldData;
	details: HoldDataDetails;
	text: string;
}
export default function PreviewButton({data, details, text}: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const modal = isOpen
		? <DataPreview data={data} details={details} onClose={() => setIsOpen(false)} />
		: null;

	return <>
		<button className="button" onClick={() => setIsOpen(!isOpen)}>{text}</button>
		{createPortal(modal, document.body)}
	</>;
}