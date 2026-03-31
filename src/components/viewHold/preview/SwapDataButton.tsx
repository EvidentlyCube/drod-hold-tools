import { useCallback } from "react";
import { createPortal } from "react-dom";
import type { DataFormat } from "../../../data/DrodEnums";
import type { Hold } from "../../../data/datatypes/Hold";
import { useBoolState } from "../../../hooks/useBoolState";
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
	const [isOpen, setOpen, setClose] = useBoolState(false);
	const onSelect = useCallback(
		(dataId: number | undefined) => {
			if (dataId === dataSource.oldValue) {
				dataSource.unset();
			} else {
				dataSource.set(true, dataId);
			}
			setClose();
		},
		[dataSource, setClose],
	);
	const onUnset = useCallback(() => {
		dataSource.unset();
		setClose();
	}, [dataSource, setClose]);

	const modal = isOpen ? (
		<SelectDataModal
			hold={hold}
			formats={formats}
			allowEmpty={true}
			onClose={setClose}
			onSelect={onSelect}
		/>
	) : null;

	return (
		<>
			<button
				type="button"
				className={`button is-small is-tooltip`}
				onClick={setOpen}
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
