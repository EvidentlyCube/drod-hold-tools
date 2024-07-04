import { useEffect, useState } from "react";
import { DataFormat } from "../../data/DrodEnums";
import { base64ToUint8 } from "../../data/Utils";
import { HoldData } from "../../data/datatypes/HoldData";
import ImagePreview from "./preview/ImagePreview";
import Modal from "../common/Modal";
import AudioPreview from "./preview/AudioPreview";

interface Props {
	data: HoldData;
	onClose: () => void
}
export default function DataPreview({ data, onClose }: Props) {
	const [dataUri, setDataUri] = useState("");

	useEffect(() => {
		const mimetype = formatToMimetype(data.format);

		if (!mimetype) {
			return;
		}

		const bytes = base64ToUint8(data.rawEncodedData);
		const url = URL.createObjectURL(new Blob([bytes], { type: mimetype}));

		setDataUri(url);

		return () => URL.revokeObjectURL(url)
	}, [data, setDataUri]);

	switch (data.format) {
		case DataFormat.BMP:
		case DataFormat.PNG:
		case DataFormat.JPG:
			return <ImagePreview
				dataUri={dataUri}
				name={data.name.finalText}
				onClose={onClose}
			/>

		case DataFormat.OGG:
		case DataFormat.WAV:
			return <AudioPreview
				dataUri={dataUri}
				name={data.name.finalText}
				onClose={onClose}
				/>;

		default:
			return <Modal onClose={onClose}>
				<div className="container has-text-centered has-background-white p-4">
					<h2 className="is-size-2">{data.name.finalText}</h2>
					<p>No preview for format {data.format}</p>
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
		default:
			return undefined;
	}
}