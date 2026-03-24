import { ChangeEvent, useCallback, useState } from "react";
import { Hold } from "../../../data/datatypes/Hold";
import Modal from "../../common/Modal";
import { importDataArchive, ImportDataArchiveFileStatus } from "../../../processor/importDataArchive";
import { createPortal } from "react-dom";
import { pluralize } from "../../../utils/StringUtils";
import { HoldData } from "../../../data/datatypes/HoldData";
import { DataFormat } from "../../../data/DrodEnums";

interface FileStatus {
	name: string;
	context: string;
	status: ImportDataArchiveFileStatus;
}

interface Props {
	hold: Hold;
}

export default function BulkManageUnusedDataButton({ hold }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const onClick = useCallback(() => setIsOpen(true), []);
	const onClose = useCallback(() => setIsOpen(false), []);

	const modal = isOpen
		? <InfoModal hold={hold} onClose={onClose} />
		: null;

	return <div className="control" title="Upload a zip file with identically named files to replace them.">
		<div className="button is-primary" onClick={onClick}>
			<span className="file-icon">
				<i className="fas fa-broom"></i>
			</span>
			<span className="file-label">
				Manage unused data
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
	const unusedData = hold.datas.filterToArray(data => data.$uses.length === 0);

	const onDeleteAll = useCallback(() => {
		hold.datas.forEach(data => data.$isDeleted.newValue = data.$uses.length === 0);
		onClose();
	}, [hold, onClose])
	const onRestoreAll = useCallback(() => {
		hold.datas.forEach(data => data.$isDeleted.newValue = false);
		onClose();
	}, [hold, onClose])

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Manage unused data</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<div className="content">
						<h3 className="is-size-2">{unusedData.length} unused {pluralize(unusedData.length, 'data')} found</h3>
						<ul className="content">
							{unusedData.map(data => <DataRow key={data.id} data={data} />)}
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

function DataRow({ data }: { data: HoldData }) {
	let icon;

	switch (data.details.newValue.format) {
		case DataFormat.Unknown:
			icon = <Icon name="fa-circle-question" />;
			break;

		case DataFormat.BMP:
		case DataFormat.JPG:
		case DataFormat.PNG:
			icon = <Icon name="fa-image" />;
			break;

		case DataFormat.S3M:
		case DataFormat.WAV:
		case DataFormat.OGG:
			icon = <Icon name="fa-music" />;
			break;
		case DataFormat.TTF:
			icon = <Icon name="fa-font" />;
			break;

		case DataFormat.THEORA:
			icon = <Icon name="fa-video" />;
			break;
	}
	return <li key={data.id}>
		{icon}
		{data.name.newValue}
	</li>;
}

function Icon({ name }: { name: string }) {
	return <span className="icon">
		<i className={`fas ${name}`}></i>
	</span>;
}