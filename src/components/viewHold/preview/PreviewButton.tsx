import { createPortal } from "react-dom";
import type {
	HoldData,
	HoldDataDetails,
} from "../../../data/datatypes/HoldData";
import { useBoolState } from "../../../hooks/useBoolState";
import DataPreview from "../DataPreview";

interface Props {
	data: HoldData;
	details: HoldDataDetails;
	text: string;
}
export default function PreviewButton({ data, details, text }: Props) {
	const [isOpen, setOpen, setClose] = useBoolState(false);

	const modal = isOpen ? (
		<DataPreview data={data} details={details} onClose={setClose} />
	) : null;

	return (
		<>
			<button type="button" className="button" onClick={setOpen}>
				{text}
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
