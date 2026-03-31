import { createPortal } from "react-dom";
import type { HoldData } from "../../../data/datatypes/HoldData";
import { useBoolState } from "../../../hooks/useBoolState";
import DataUsesPreview from "./DataUsesPreview";

interface Props {
	data: HoldData;
}
export default function DataUsesPreviewButton({ data }: Props) {
	const { $uses } = data;
	const [isOpen, setOpen, setClose] = useBoolState(false);

	const modal = isOpen ? (
		<DataUsesPreview data={data} onClose={setClose} />
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
