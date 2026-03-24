import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Hold } from "../../../data/datatypes/Hold";
import { createDataArchive } from "../../../processor/createDataArchive";

interface Props {
	hold: Hold;
}

export default function DataDownloadButton({ hold }: Props) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [objectUrl, setObjectUrl] = useState('');
	const [progress, setProgress] = useState(0);

	const archiveName = String(hold.name.newValue).replace(/[^\w\-_. ]+/g, '') + " - All Data.zip";

	const processArchive = useCallback(async () => {
		if (isOpen) {
			return;
		}

		setIsOpen(true);
		setIsProcessing(true);

		try {
			const archive = await createDataArchive(hold, p => setProgress(p));
			const blob = new Blob([archive], { type: 'application/zip' });
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
		? <DownloadModal archiveName={archiveName} progress={progress} objectUrl={objectUrl} canClose={!isProcessing} onClose={onClose} />
		: null;

	return <div className="control" title="Upload a zip file with identically named files to replace them.">
		<div className="button is-primary" onClick={processArchive}>
			<span className="file-icon">
				<i className="fas fa-download"></i>
			</span>
			<span className="file-label">
				Download all data
			</span>
		</div>
		{isOpen && createPortal(modal, document.body)}
	</div>
}
interface DownloadModalProps {
	archiveName: string;
	progress: number;
	objectUrl: string;
	canClose: boolean;
	onClose: () => void;
}

function DownloadModal({ archiveName, progress, objectUrl, canClose, onClose }: DownloadModalProps) {
	const percent = progress * 100 | 0;
	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Bulk data replace</p>
					{canClose && <button className="delete" onClick={onClose}></button>}
				</header>
				<section className="modal-card-body">
					{!objectUrl && <>
						<h3 className="is-size-3">Preparing archive</h3>
						<progress className="progress" value={percent.toString()} max="100"></progress>
					</>}
					{objectUrl && <h3 className="is-size-3">Ready to download</h3>}
				</section>
				<footer className="modal-card-foot">
					<div className="buttons is-flex-grow-1">
						{objectUrl && <a href={objectUrl} className="button" download={archiveName}>Download Archive</a>}
						{!objectUrl && <button className="button" disabled={true}>Download Archive</button>}
						<span className="is-flex-grow-1"></span>
						<button onClick={onClose} className="button" disabled={!canClose}>Close</button>
					</div>
				</footer>
			</div>
		</div>
	);
}