import { type ChangeEvent, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { Hold } from "../../../data/datatypes/Hold";
import {
	type ImportAllTextsResult,
	importAllTexts,
} from "../../../processor/importAllTexts";
import Modal from "../../common/Modal";

interface Props {
	hold: Hold;
}

export default function TextImportButton({ hold }: Props) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<ImportAllTextsResult | undefined>(
		undefined,
	);

	const processArchive = useCallback(
		async (file: File) => {
			setIsOpen(true);
			setIsProcessing(true);
			setProgress(0);
			setResult(undefined);

			try {
				const csvData = await file.text();

				const result = await importAllTexts(csvData, hold, p => setProgress(p));
				setResult(result);
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
		<ResultsModal
			progressFactor={progress}
			result={result}
			canClose={!isProcessing}
			onClose={onClose}
		/>
	) : null;

	return (
		<div className="control" title="Upload a CSV file with updated texts.">
			<label className="file-label">
				<input
					className="file-input"
					type="file"
					accept=".csv"
					onChange={onFileSelected}
					disabled={isProcessing}
				/>
				<span className="button is-primary">
					<span className="file-icon">
						<i className="fas fa-upload"></i>
					</span>
					<span className="file-label">Import texts</span>
				</span>
			</label>
			{isOpen && createPortal(modal, document.body)}
		</div>
	);
}
interface ResultsModalProps {
	progressFactor: number;
	result?: ImportAllTextsResult;
	canClose: boolean;
	onClose: () => void;
}

function ResultsModal({
	progressFactor: progress,
	result,
	canClose,
	onClose,
}: ResultsModalProps) {
	return (
		<Modal title="Import Texts" onClose={onClose} canClose={canClose}>
			{!result && (
				<>
					<h3 className="is-size-3">Importing</h3>
					<progress
						className="progress"
						value={(progress * 100).toString()}
						max="100"
					></progress>
				</>
			)}
			{!!result && result.isSuccess && (
				<>
					<h3 className="is-size-3">Import Finished</h3>
					<ul>
						<li>
							<strong>Updated records:</strong> {result.updatedRows}
						</li>
						<li>
							<strong>Identical records:</strong> {result.identicalRows}
						</li>
						<li>
							<strong>Ignored rows:</strong> {result.unresolvableRefs}
						</li>
					</ul>
				</>
			)}
			{!!result && !result.isSuccess && (
				<>
					<h3 className="is-size-3">Import Failed</h3>
					<p>{result.causedBy.message}</p>
				</>
			)}
		</Modal>
	);
}
