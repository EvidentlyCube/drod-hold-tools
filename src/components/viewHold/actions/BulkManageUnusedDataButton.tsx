import { type ReactNode, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { DataFormat } from "../../../data/DrodEnums";
import type { Hold } from "../../../data/datatypes/Hold";
import type { HoldData } from "../../../data/datatypes/HoldData";
import { shouldBeUnreachable } from "../../../utils/Interfaces";
import { pluralize } from "../../../utils/StringUtils";
import Modal from "../../common/Modal";

interface Props {
	hold: Hold;
}

export default function BulkManageUnusedDataButton({ hold }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const onClick = useCallback(() => setIsOpen(true), []);
	const onClose = useCallback(() => setIsOpen(false), []);

	const modal = isOpen ? <InfoModal hold={hold} onClose={onClose} /> : null;

	return (
		<div className="control" title="Bulk delete or restore unused data">
			<button type="button" className="button is-primary" onClick={onClick}>
				<span className="file-icon">
					<i className="fas fa-broom"></i>
				</span>
				<span className="file-label">Manage unused data</span>
			</button>
			{isOpen && createPortal(modal, document.body)}
		</div>
	);
}
interface ResultsModalProps {
	hold: Hold;
	onClose: () => void;
}

function InfoModal({ hold, onClose }: ResultsModalProps) {
	const unusedData = hold.datas.filterToArray(data => data.$uses.length === 0);

	const onDeleteAll = useCallback(() => {
		hold.datas.forEach(data => {
			data.$isDeleted.newValue = data.$uses.length === 0;
		});
		onClose();
	}, [hold, onClose]);
	const onRestoreAll = useCallback(() => {
		hold.datas.forEach(data => {
			data.$isDeleted.newValue = false;
		});
		onClose();
	}, [hold, onClose]);

	return (
		<Modal
			title="Manage unused data"
			onClose={onClose}
			buttons={[
				<button
					key="delete"
					type="button"
					onClick={onDeleteAll}
					className="button is-danger"
				>
					Delete All
				</button>,
				<button
					key="restore"
					type="button"
					onClick={onRestoreAll}
					className="button is-warning"
				>
					Restore All
				</button>,
			]}
		>
			<h3 className="is-size-2">
				{unusedData.length} unused {pluralize(unusedData.length, "data")} found
			</h3>
			<ul className="content">
				{unusedData.map(data => (
					<DataRow key={data.id} data={data} />
				))}
			</ul>
		</Modal>
	);
}

function DataRow({ data }: { data: HoldData }) {
	let icon: ReactNode = null;

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

		default:
			shouldBeUnreachable(data.details.newValue.format);
			break;
	}
	return (
		<li key={data.id}>
			{icon}
			{data.name.newValue}
		</li>
	);
}

function Icon({ name }: { name: string }) {
	return (
		<span className="icon">
			<i className={`fas ${name}`}></i>
		</span>
	);
}
