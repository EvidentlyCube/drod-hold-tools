import { DataFormat } from "../../data/DrodEnums";
import {
	getFormatName
} from "../../data/Utils";
import { Hold } from "../../data/datatypes/Hold";

interface Props {
	hold: Hold;
	dataId?: number;
}

export default function DataRefView({ hold, dataId }: Props) {
	const data = hold.datas.get(dataId ?? -1);

	if (!data) {
		return <span className="is-muted">None</span>;
	}

	return (
		<div title={`${data.id}: ${data.name.finalText}`}>
			<span className="icon">
				<i className={`fas ${getDataIconClass(data.format)}`}></i>
			</span>{" "}
			{getFormatName(data.format)}
		</div>
	);
}

function getDataIconClass(format: DataFormat) {
	switch (format) {
		case DataFormat.BMP:
		case DataFormat.JPG:
		case DataFormat.PNG:
			return "fa-image";
		case DataFormat.WAV:
		case DataFormat.OGG:
		case DataFormat.S3M:
			return "fa-music";
		case DataFormat.THEORA:
			return "fa-film";
		case DataFormat.TTF:
			return "fa-font";
		case DataFormat.Unknown:
			return "fa-question";
		default:
			return "fa-triangle-exclamation";
	}
}
