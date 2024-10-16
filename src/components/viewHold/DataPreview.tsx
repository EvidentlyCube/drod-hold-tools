import { useEffect, useState } from "react";
import { DataFormat } from "../../data/DrodEnums";
import { HoldData, HoldDataDetails } from "../../data/datatypes/HoldData";
import ImagePreview from "./preview/ImagePreview";
import Modal from "../common/Modal";
import AudioPreview from "./preview/AudioPreview";
import { base64ToUint8 } from "../../utils/StringUtils";
import { shouldBeUnreachable } from "../../utils/Interfaces";

interface Props {
	data: HoldData;
	details: HoldDataDetails;
	onClose: () => void;
}
export default function DataPreview({ data, details, onClose }: Props) {
	const [dataUri, setDataUri] = useState("");

	useEffect(() => {
		const mimetype = formatToMimetype(details.format);

		if (!mimetype) {
			return;
		}

		const bytes = base64ToUint8(details.rawEncodedData);
		const url = URL.createObjectURL(new Blob([bytes], { type: mimetype}));

		setDataUri(url);

		return () => URL.revokeObjectURL(url)
	}, [details, setDataUri]);

	switch (details.format) {
		case DataFormat.BMP:
		case DataFormat.PNG:
		case DataFormat.JPG:
			return <ImagePreview
				dataUri={dataUri}
				name={data.name.newValue}
				onClose={onClose}
			/>

		case DataFormat.OGG:
		case DataFormat.WAV:
			return <AudioPreview
				dataUri={dataUri}
				name={data.name.newValue}
				onClose={onClose}
				/>;

		default:
			return <Modal onClose={onClose}>
				<div className="container has-text-centered has-background-white p-4">
					<h2 className="is-size-2">{data.name.newValue}</h2>
					<p>No preview for format {details.format}</p>
				</div>
			</Modal>;
	}
}

function formatToMimetype(format: DataFormat): string | undefined {
	switch (format) {
		case DataFormat.BMP:
			return 'image/bmp';
		case DataFormat.PNG:
			return 'image/png';
		case DataFormat.JPG:
			return 'image/jpeg';
		case DataFormat.OGG:
			return 'audio/ogg';
		case DataFormat.WAV:
			return 'audio/wav';
		case DataFormat.S3M:
		case DataFormat.THEORA:
		case DataFormat.TTF:
		case DataFormat.Unknown:
			return 'application/octet-stream';

		default:
			shouldBeUnreachable(format);
			return undefined;
	}
}