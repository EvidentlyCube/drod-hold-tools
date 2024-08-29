import { useCallback, useRef } from "react";
import { useSignalUpdatableValue } from "../../../hooks/useSignalUpdatableValue";
import { SignalUpdatableValue } from "../../../utils/SignalUpdatableValue";
import { formatDateTimeForInput } from "../../../utils/DateUtils";

interface Props {
	datetime: SignalUpdatableValue<number>;
}
export default function DateTimeEditor({datetime}: Props) {
	const [oldValue, isEdited, newValue] = useSignalUpdatableValue(datetime);
	const inputRef = useRef(null);

	const onToggle = useCallback(() => {
		if (!isEdited) {
			datetime.set(true, datetime.oldValue);
			if (inputRef.current) {
				(inputRef.current as HTMLElement).focus()
			}
		} else {
			datetime.unset();
		}
	}, [datetime, isEdited]);

	const onBlur = useCallback(() => {
		if (isEdited && datetime.newValue === datetime.oldValue) {
			datetime.unset();
		}
	}, [datetime, isEdited])

	// Using any to avoid typescript complaints about type
	const onType = useCallback((e: any) => {
		datetime.set(true, (new Date(e.target.value).getTime()));
	}, [datetime]);

	const title = isEdited
		? "Cancel changes"
		: "Edit text";

	return <div className="control has-icons-left">
		<input
			type="datetime-local"
			className="input is-read-only-hidden"
			value={formatDateTimeForInput(newValue)}
			readOnly={!isEdited}
			onInput={onType}
			ref={inputRef}
			onClick={!isEdited ? onToggle : undefined}
			onBlur={onBlur}
			title={(new Date(oldValue)).toLocaleString()}
			/>
		<div className="icon is-small is-left is-interactive" onClick={onToggle} title={title}>
			{!isEdited && <i className="fas fa-pen-to-square" />}
			{isEdited && <i className="fas fa-rotate-left" />}
		</div>
	</div>
}