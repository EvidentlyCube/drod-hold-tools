import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useMemo,
	useState,
} from "react";
import type { HoldVariable } from "../../../data/datatypes/HoldVariable";
import { validateVariableRenaming } from "../../../data/VariableUtils";
import FullModal from "../../common/FullModal";

interface Props {
	variable: HoldVariable;
	onClose: () => void;
	onRename: (newName: string) => void;
}
export default function VariableRenameModal(props: Props) {
	const { variable, onClose, onRename } = props;

	const [newName, setNewName] = useState(variable.name.newValue);
	const error = useMemo(() => {
		return validateVariableRenaming(
			variable.hold,
			variable.name.newValue,
			newName,
		);
	}, [newName, variable.hold, variable.name.newValue]);

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => setNewName(e.target.value),
		[],
	);
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (
				!error
				&& e.key === "Enter"
				&& !e.altKey
				&& !e.shiftKey
				&& !e.ctrlKey
			) {
				onRename(newName);
			}
		},
		[newName, onRename, error],
	);

	return (
		<FullModal
			title={`Rename variable "${variable.name.newValue}"`}
			onClose={onClose}
			buttons={
				<button
					type="button"
					className="button is-danger"
					onClick={() => onRename(newName)}
					disabled={error !== false}
				>
					Rename
				</button>
			}
		>
			<div className="notification is-danger has-text-centered">
				This is super dangerous! Backup your hold and check things are working
				correctly after renaming.
			</div>

			<div className="field has-text-centered">
				<label htmlFor="variable-rename" className="label">
					New Variable Name
				</label>
				<div className="control is-inline-block">
					<input
						// biome-ignore lint: We want auto focus
						autoFocus={true}
						id="variable-rename"
						className="input is-medium has-text-centered"
						type="text"
						placeholder="Enter new variable name"
						value={newName}
						onKeyDown={handleKeyDown}
						onChange={handleChange}
					/>
				</div>
			</div>

			{error ? (
				<p className="help is-danger has-text-centered mt-3">{error}</p>
			) : (
				<p className="help is-success has-text-centered mt-3">Looking good!</p>
			)}
		</FullModal>
	);
}
