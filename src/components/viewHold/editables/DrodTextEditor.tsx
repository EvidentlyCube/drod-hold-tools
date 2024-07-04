import { ChangeEvent, useCallback, useRef } from "react";
import { DrodText } from "../../../data/datatypes/DrodText";
import { useSignalDrodText } from "../../../hooks/useSignalDrodText";

interface Props {
	text: DrodText;
}
export default function DrodTextEditor({text}: Props) {
	const [oldText, newText] = useSignalDrodText(text);
	const inputRef = useRef<HTMLInputElement>(null);
	const isEdited = newText !== undefined;

	const onToggle = useCallback(() => {
		if (newText === undefined) {
			text.newText = text.oldText;
			if (inputRef.current) {
				inputRef.current.focus()
			}
		} else {
			text.newText = undefined;
		}
	}, [text, newText]);

	const onBlur = useCallback(() => {
		if (isEdited && text.newText === text.oldText) {
			text.newText = undefined;
		}
	}, [text, isEdited])

	const onType = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		text.newText = e.target.value;
	}, [text]);

	const title = isEdited
		? "Cancel changes"
		: "Edit text";

	return <div className="control has-icons-left">
		<input
			className="input is-read-only-hidden"
			value={newText ?? oldText}
			readOnly={newText === undefined}
			onInput={onType}
			ref={inputRef}
			onClick={!isEdited ? onToggle : undefined}
			onBlur={onBlur}
			title={oldText}
			/>
		<div className="icon is-small is-left is-interactive" onClick={onToggle} title={title}>
			{newText === undefined && <i className="fas fa-pen-to-square" />}
			{newText !== undefined && <i className="fas fa-xmark" />}
		</div>
	</div>
}