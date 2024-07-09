import { useCallback, useRef } from "react";
import { useSignalUpdatableValue } from "../../../hooks/useSignalUpdatableValue";
import ReactTextareaAutosize from "react-textarea-autosize";
import { SignalUpdatableValue } from "../../../utils/SignalUpdatableValue";

interface Props {
	text: SignalUpdatableValue<string>;
	tag?: 'input'|'textarea';
}
export default function DrodTextEditor({text, tag}: Props) {
	const [oldValue, isEdited, newValue] = useSignalUpdatableValue(text);
	const inputRef = useRef(null);

	const onToggle = useCallback(() => {
		if (!isEdited) {
			text.newValue = text.oldValue;
			if (inputRef.current) {
				(inputRef.current as HTMLElement).focus()
			}
		} else {
			text.unset();
		}
	}, [text, isEdited]);

	const onBlur = useCallback(() => {
		if (isEdited && text.newValue === text.oldValue) {
			text.unset();
		}
	}, [text, isEdited])

	// Using any to avoid typescript complaints about type
	const onType = useCallback((e: any) => {
		text.newValue = e.target.value;
	}, [text]);

	const title = isEdited
		? "Cancel changes"
		: "Edit text";

	if (tag === 'textarea') {
		return <div className="control has-icons-left">
			<ReactTextareaAutosize
				className="textarea textarea-auto-size is-read-only-hidden"
				value={newValue}
				readOnly={!isEdited}
				onInput={onType}
				ref={inputRef}
				onClick={!isEdited ? onToggle : undefined}
				onBlur={onBlur}
				title={oldValue}
				minRows={1}
				maxRows={8}
				/>
			<div className="icon is-small is-left is-interactive" onClick={onToggle} title={title}>
				{!isEdited && <i className="fas fa-pen-to-square" />}
				{isEdited && <i className="fas fa-rotate-left" />}
			</div>
		</div>
	} else {
		return <div className="control has-icons-left">
			<input
				className="input is-read-only-hidden"
				value={newValue}
				readOnly={!isEdited}
				onInput={onType}
				ref={inputRef}
				onClick={!isEdited ? onToggle : undefined}
				onBlur={onBlur}
				title={oldValue}
				/>
			<div className="icon is-small is-left is-interactive" onClick={onToggle} title={title}>
				{!isEdited && <i className="fas fa-pen-to-square" />}
				{isEdited && <i className="fas fa-rotate-left" />}
			</div>
		</div>
	}
}