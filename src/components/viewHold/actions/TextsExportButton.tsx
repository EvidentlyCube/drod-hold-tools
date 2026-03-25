import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Hold } from "../../../data/datatypes/Hold";
import { exportAllTexts } from "../../../processor/exportAllTexts";

interface Props {
	hold: Hold;
}

export default function TextsExportButton({ hold }: Props) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [objectUrl, setObjectUrl] = useState('');
	const [progress, setProgress] = useState(0);

	const csvName = String(hold.name.newValue).replace(/[^\w\-_. ]+/g, '') + " - All Texts.csv";

	const processArchive = useCallback(async () => {
		if (isOpen) {
			return;
		}

		setIsOpen(true);
		setIsProcessing(true);

		try {
			const csvFile = await exportAllTexts(hold, p => setProgress(p));
			const blob = new Blob([csvFile], { type: 'text/csv' });
			setObjectUrl(URL.createObjectURL(blob));

		} finally {
			setIsProcessing(false);
		}

	}, [hold, isOpen]);

	const onClose = useCallback(() => {
		if (isProcessing) {
			return;
		}
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl);
			setObjectUrl("");
		}

		setIsOpen(false);

	}, [isProcessing, objectUrl]);

	const modal = isOpen
		? <DownloadModal csvName={csvName} progress={progress} objectUrl={objectUrl} canClose={!isProcessing} onClose={onClose} />
		: null;

	return <button className="button is-primary" onClick={processArchive} title="Download a CSV with all editable texts in the hold">
		<span className="file-icon">
			<i className="fas fa-download"></i>
		</span>
		Export texts
		{isOpen && createPortal(modal, document.body)}
	</button>
}
interface DownloadModalProps {
	csvName: string;
	progress: number;
	objectUrl: string;
	canClose: boolean;
	onClose: () => void;
}

function DownloadModal({ csvName: archiveName, progress, objectUrl, canClose, onClose }: DownloadModalProps) {
	const percent = progress * 100 | 0;
	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Export all texts</p>
					{canClose && <button className="delete" onClick={onClose}></button>}
				</header>
				<section className="modal-card-body">
					{!objectUrl && <>
						<h3 className="is-size-3">Preparing file</h3>
						<progress className="progress" value={percent.toString()} max="100"></progress>
					</>}
					{objectUrl && <h3 className="is-size-3">Ready to download</h3>}
				</section>
				<footer className="modal-card-foot">
					<div className="buttons is-flex-grow-1">
						{objectUrl && <a href={objectUrl} className="button" download={archiveName}>Download CSV</a>}
						{!objectUrl && <button className="button" disabled={true}>Download CSV</button>}
						<span className="is-flex-grow-1"></span>
						<button onClick={onClose} className="button" disabled={!canClose}>Close</button>
					</div>
				</footer>
			</div>
		</div>
	);
}