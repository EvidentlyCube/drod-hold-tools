import { type ChangeEvent, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { Hold } from "../../../data/datatypes/Hold";
import {
	type ImportDataArchiveFileStatus,
	importDataArchive,
} from "../../../processor/importDataArchive";
import Modal from "../../common/Modal";

interface FileStatus {
	name: string;
	context: string;
	status: ImportDataArchiveFileStatus;
}

interface Props {
	hold: Hold;
}

export default function BulkDataReplaceButton({ hold }: Props) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [files, setFiles] = useState<FileStatus[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	const processArchive = useCallback(
		async (file: File) => {
			setFiles([]);
			setIsOpen(true);
			setIsProcessing(true);

			try {
				const data = await file.bytes();

				await importDataArchive(hold, data, {
					onLog: (name, status, context) =>
						setFiles(prev => [...prev, { name, context, status }]),
				});
			} finally {
				setIsProcessing(false);
			}
		},
		[hold],
	);

	const onFileSelected = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			e.target.value = "";

			void processArchive(file);
		},
		[processArchive],
	);

	const onClose = useCallback(() => {
		if (!isProcessing) {
			setIsOpen(false);
		}
	}, [isProcessing]);

	const modal = isOpen ? (
		<ResultsModal files={files} canClose={!isProcessing} onClose={onClose} />
	) : null;

	return (
		<div
			className="control"
			title="Upload a zip file with identically named files to replace them."
		>
			<label className="file-label">
				<input
					className="file-input"
					type="file"
					accept=".zip"
					onChange={onFileSelected}
					disabled={isProcessing}
				/>
				<span className="button is-primary">
					<span className="file-icon">
						<i className="fas fa-upload"></i>
					</span>
					<span className="file-label">Replace all data</span>
				</span>
			</label>
			{isOpen && createPortal(modal, document.body)}
		</div>
	);
}
interface ResultsModalProps {
	files: FileStatus[];
	canClose: boolean;
	onClose: () => void;
}

function ResultsModal({ files, canClose, onClose }: ResultsModalProps) {
	return (
		<Modal title="Bulk data replace" canClose={canClose} onClose={onClose}>
			<FileList
				files={files}
				filterByStatus="replaced"
				header="Updated Files"
				className="has-text-success"
			/>
			<FileList
				files={files}
				filterByStatus="identical"
				header="Identical Files"
				className="has-text-info"
			/>
			<FileList
				files={files}
				filterByStatus="no-match"
				header="Unmatched Files"
				className="has-text-warning"
			/>
			<FileList
				files={files}
				filterByStatus="error"
				header="Errors"
				className="has-text-error"
			/>
		</Modal>
	);
}

interface FileListProps {
	files: FileStatus[];
	filterByStatus: ImportDataArchiveFileStatus;
	header: string;
	className: string;
}

function FileList({ files, filterByStatus, header, className }: FileListProps) {
	const filteredFiles = files.filter(f => f.status === filterByStatus);

	if (filteredFiles.length === 0) {
		return null;
	}

	return (
		<>
			<h4 className="is-size-3">{header}</h4>
			<ul>
				{filteredFiles.map(f => (
					<li key={f.name} className={className}>
						{f.name}
						{f.context ? ` - ${f.context}` : ""}
					</li>
				))}
			</ul>
		</>
	);
}
