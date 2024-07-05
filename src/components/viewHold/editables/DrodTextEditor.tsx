import { ChangeEvent, useCallback, useRef } from "react";
import { useSignalUpdatableValue } from "../../../hooks/useSignalUpdatableValue";
import { SignalUpdatableValue } from "../../../utils/SignalUpdatableValue";

interface Props {
	text: SignalUpdatableValue<string>;
}
export default function DrodTextEditor({text}: Props) {
	const [oldValue, newValue] = useSignalUpdatableValue(text);
	const inputRef = useRef<HTMLInputElement>(null);
	const isEdited = newValue !== undefined;

	const onToggle = useCallback(() => {
		if (newValue === undefined) {
			text.newValue = text.oldValue;
			if (inputRef.current) {
				inputRef.current.focus()
			}
		} else {
			text.newValue = undefined;
		}
	}, [text, newValue]);

	const onBlur = useCallback(() => {
		if (isEdited && text.newValue === text.oldValue) {
			text.newValue = undefined;
		}
	}, [text, isEdited])

	const onType = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		text.newValue = e.target.value;
	}, [text]);

	const title = isEdited
		? "Cancel changes"
		: "Edit text";

	return <div className="control has-icons-left">
		<input
			className="input is-read-only-hidden"
			value={newValue ?? oldValue}
			readOnly={newValue === undefined}
			onInput={onType}
			ref={inputRef}
			onClick={!isEdited ? onToggle : undefined}
			onBlur={onBlur}
			title={oldValue}
			/>
		<div className="icon is-small is-left is-interactive" onClick={onToggle} title={title}>
			{newValue === undefined && <i className="fas fa-pen-to-square" />}
			{newValue !== undefined && <i className="fas fa-xmark" />}
		</div>
	</div>
}