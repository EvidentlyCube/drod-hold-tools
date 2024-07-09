import { useCallback, useRef } from "react";
import { useSignalUpdatableValue } from "../../../hooks/useSignalUpdatableValue";
import { SignalUpdatableValue } from "../../../utils/SignalUpdatableValue";
import ReactTextareaAutosize from "react-textarea-autosize";

interface Props {
	text: SignalUpdatableValue<string>;
	tag?: 'input'|'textarea';
}
export default function DrodTextEditor({text, tag}: Props) {
	const [oldValue, newValue] = useSignalUpdatableValue(text);
	const inputRef = useRef(null);
	const isEdited = newValue !== undefined;

	const onToggle = useCallback(() => {
		if (newValue === undefined) {
			text.newValue = text.oldValue;
			if (inputRef.current) {
				(inputRef.current as HTMLElement).focus()
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
				value={newValue ?? oldValue}
				readOnly={newValue === undefined}
				onInput={onType}
				ref={inputRef}
				onClick={!isEdited ? onToggle : undefined}
				onBlur={onBlur}
				title={oldValue}
				minRows={1}
				maxRows={8}
				/>
			<div className="icon is-small is-left is-interactive" onClick={onToggle} title={title}>
				{newValue === undefined && <i className="fas fa-pen-to-square" />}
				{newValue !== undefined && <i className="fas fa-rotate-left" />}
			</div>
		</div>
	} else {
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
}