import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { DataFormat } from "../../../data/DrodEnums";
import type { Hold } from "../../../data/datatypes/Hold";
import { useSignalUpdatableValue } from "../../../hooks/useSignalUpdatableValue";
import type { SignalUpdatableValue } from "../../../utils/SignalUpdatableValue";
import SelectDataModal from "./SelectDataModal";

interface Props {
	hold: Hold;
	dataSource: SignalUpdatableValue<number | undefined>;
	formats: DataFormat[];
}
export default function SwapDataButton({ hold, dataSource, formats }: Props) {
	const isChanged = useSignalUpdatableValue(dataSource)[1];
	const [isOpen, setIsOpen] = useState(false);
	const onSelect = useCallback(
		(dataId: number | undefined) => {
			if (dataId === dataSource.oldValue) {
				dataSource.unset();
			} else {
				dataSource.set(true, dataId);
			}
			setIsOpen(false);
		},
		[dataSource],
	);
	const onUnset = useCallback(() => {
		dataSource.unset();
		setIsOpen(false);
	}, [dataSource]);

	const modal = isOpen ? (
		<SelectDataModal
			hold={hold}
			formats={formats}
			allowEmpty={true}
			onClose={() => setIsOpen(false)}
			onSelect={onSelect}
		/>
	) : null;

	return (
		<>
			<button
				type="button"
				className={`button is-small is-tooltip`}
				onClick={() => setIsOpen(!isOpen)}
				title="Change "
			>
				<div className="icon">
					<i className="fas fa-arrows-rotate" />
				</div>
			</button>
			<button
				type="button"
				className={`button is-small is-warning ${!isChanged ? "is-hidden" : ""}`}
				onClick={onUnset}
				title="Undo change"
			>
				<div className="icon">
					<i className="fas fa-rotate-left" />
				</div>
			</button>
			{createPortal(modal, document.body)}
		</>
	);
}
