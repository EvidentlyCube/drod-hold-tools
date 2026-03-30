import { useState } from "react";
import { createPortal } from "react-dom";
import type {
	HoldData,
	HoldDataDetails,
} from "../../../data/datatypes/HoldData";
import DataPreview from "../DataPreview";

interface Props {
	data: HoldData;
	details: HoldDataDetails;
	text: string;
}
export default function PreviewButton({ data, details, text }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const modal = isOpen ? (
		<DataPreview
			data={data}
			details={details}
			onClose={() => setIsOpen(false)}
		/>
	) : null;

	return (
		<>
			<button
				type="button"
				className="button"
				onClick={() => setIsOpen(!isOpen)}
			>
				{text}
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
