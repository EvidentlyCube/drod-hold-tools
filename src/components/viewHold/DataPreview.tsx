import { useEffect, useState } from "react";
import { HoldData } from "../../data/datatypes/HoldData";
import { DataFormat } from "../../data/DrodEnums";
import { base64ToUint8 } from "../../data/Utils";

interface Props {
	data: HoldData;
}
export default function DataPreview({ data }: Props) {
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
			return <img src={dataUri} alt={data.name.finalText} />
		case DataFormat.OGG:
		case DataFormat.WAV:
			return <audio src={dataUri} controls={true} autoPlay/>
		default:
			return <strong>No preview available</strong>
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