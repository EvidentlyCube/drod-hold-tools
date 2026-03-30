import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { Hold } from "../../../data/datatypes/Hold";
import { createDataArchive } from "../../../processor/createDataArchive";
import { sanitizeFileName } from "../../../utils/FileUtils";
import Modal from "../../common/Modal";

interface Props {
	hold: Hold;
}

export default function DataDownloadButton({ hold }: Props) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [objectUrl, setObjectUrl] = useState("");
	const [progress, setProgress] = useState(0);

	const archiveName = `${sanitizeFileName(hold.name.newValue)} - All Data.zip`;

	const processArchive = useCallback(async () => {
		if (isOpen) {
			return;
		}

		setIsOpen(true);
		setIsProcessing(true);

		try {
			const archive = await createDataArchive(hold, p => setProgress(p));
			const blob = new Blob([archive], { type: "application/zip" });
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

	const modal = isOpen ? (
		<DownloadModal
			archiveName={archiveName}
			progress={progress}
			objectUrl={objectUrl}
			canClose={!isProcessing}
			onClose={onClose}
		/>
	) : null;

	return (
		<div
			className="control"
			title="Download a zip archive with all data files in the hold"
		>
			<button
				type="button"
				className="button is-primary"
				onClick={processArchive}
			>
				<span className="file-icon">
					<i className="fas fa-download"></i>
				</span>
				<span className="file-label">Download all data</span>
			</button>
			{isOpen && createPortal(modal, document.body)}
		</div>
	);
}
interface DownloadModalProps {
	archiveName: string;
	progress: number;
	objectUrl: string;
	canClose: boolean;
	onClose: () => void;
}

function DownloadModal({
	archiveName,
	progress,
	objectUrl,
	canClose,
	onClose,
}: DownloadModalProps) {
	const percent = (progress * 100) | 0;
	return (
		<Modal
			title="Bulk data replace"
			canClose={canClose}
			onClose={onClose}
			buttons=<>
				{objectUrl && (
					<a href={objectUrl} className="button" download={archiveName}>
						Download Archive
					</a>
				)}
				{!objectUrl && (
					<button type="button" className="button" disabled={true}>
						Download Archive
					</button>
				)}
			</>
		>
			{!objectUrl && (
				<>
					<h3 className="is-size-3">Preparing archive</h3>
					<progress
						className="progress"
						value={percent.toString()}
						max="100"
					></progress>
				</>
			)}
			{objectUrl && <h3 className="is-size-3">Ready to download</h3>}
		</Modal>
	);
}
