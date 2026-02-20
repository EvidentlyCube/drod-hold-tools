import { useMemo, useState } from "react";
import { HoldVariable } from "../../../data/datatypes/HoldVariable";
import { validateVariableRenaming } from "../../../data/VariableUtils";

interface Props {
	variable: HoldVariable,
	onClose: () => void;
	onRename: (newName: string) => void;
}
export default function VariableRenameModal(props: Props) {
	const { variable, onClose, onRename } = props;

	const [newName, setNewName] = useState(variable.name.newValue);
	const error = useMemo(() => {
		return validateVariableRenaming(variable.hold, variable.name.newValue, newName)
	}, [newName, variable.hold, variable.name.newValue]);

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Rename variable "{variable.name.newValue}"</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<div className="notification is-danger has-text-centered">
						This is super dangerous! Backup your hold and check things are working correctly after renaming.
					</div>

					<div className="field has-text-centered">
						<label className="label">New Variable Name</label>
						<div className="control is-inline-block">
							<input
								className="input is-medium has-text-centered"
								type="text"
								placeholder="Enter new variable name"
								value={newName}
								onChange={e => setNewName(e.target.value)}
							/>
						</div>
					</div>

					{error
						? <p className="help is-danger has-text-centered mt-3">{error}</p>
						: <p className="help is-success has-text-centered mt-3">Looking good!</p>
					}

				</section>
				<footer className="modal-card-foot is-justify-content-center">
					<div className="buttons">
						<button className="button" onClick={onClose}>Cancel</button>
						<button
							className="button is-danger"
							disabled={error !== false}
							onClick={() => onRename(newName)}
						>Rename</button>
					</div>
				</footer>
			</div>
		</div>
	);
}
