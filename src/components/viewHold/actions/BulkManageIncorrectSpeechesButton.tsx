import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Hold } from "../../../data/datatypes/Hold";
import { HoldSpeech } from "../../../data/datatypes/HoldSpeech";
import { pluralize } from "../../../utils/StringUtils";

interface Props {
	hold: Hold;
}

export default function BulkManageIncorrectSpeechesButton({ hold }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const onClick = useCallback(() => setIsOpen(true), []);
	const onClose = useCallback(() => setIsOpen(false), []);

	const modal = isOpen
		? <InfoModal hold={hold} onClose={onClose} />
		: null;

	return <div className="control" title="Bulk delete or restore unused speeches">
		<div className="button is-primary" onClick={onClick}>
			<span className="file-icon">
				<i className="fas fa-broom"></i>
			</span>
			<span className="file-label">
				Manage unused speeches
			</span>
		</div>
		{isOpen && createPortal(modal, document.body)}
	</div>
}
interface ResultsModalProps {
	hold: Hold;
	onClose: () => void;
}

function InfoModal({ hold, onClose }: ResultsModalProps) {
	const unusedSpeeches = hold.speeches.filterToArray(speech => speech.$canDelete);

	const onDeleteAll = useCallback(() => {
		hold.speeches.forEach(speech => speech.$isDeleted.newValue = speech.$canDelete);
		onClose();
	}, [hold, onClose])
	const onRestoreAll = useCallback(() => {
		hold.speeches.forEach(speech => speech.$isDeleted.newValue = false);
		onClose();
	}, [hold, onClose])

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Manage unused speeches</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<div className="content">
						<h3 className="is-size-2">{unusedSpeeches.length} unused {pluralize(unusedSpeeches.length, 'speech', 'speeches')} found</h3>
						<p>
							Below is a list of speeches records that were found in the hold that were either
							not used at all or linked to a command which does not use speech records. In the
							past this happened when taking a speech command and editing it to be a different
							command - command's type was changed but speech remained linked.
						</p>
						<ul className="content">
							{unusedSpeeches.map(speech => <SpeechRow key={speech.id} speech={speech} />)}
						</ul>
					</div>
				</section>
				<footer className="modal-card-foot">
					<div className="buttons is-flex-grow-1">
						<button onClick={onDeleteAll} className="button is-danger">Delete All</button>
						<button onClick={onRestoreAll} className="button is-warning">Restore All</button>
						<span className="is-flex-grow-1"></span>
						<button onClick={onClose} className="button">Cancel</button>
					</div>
				</footer>
			</div>
		</div>
	);
}

function SpeechRow({ speech }: { speech: HoldSpeech }) {
	let message = speech.message.newValue;

	if (message.length > 40) {
		message = message.substring(0, 32) + "...";
	}

	return <li key={speech.id}>{message}</li>;
}