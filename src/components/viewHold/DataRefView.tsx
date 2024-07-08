import { DataFormat } from "../../data/DrodEnums";
import {
	getFormatName
} from "../../data/Utils";
import { Hold } from "../../data/datatypes/Hold";
import { HoldData } from "../../data/datatypes/HoldData";
import { useSignalUpdatableValue } from "../../hooks/useSignalUpdatableValue";

interface PropsById {
	hold: Hold;
	dataId?: number;
}

interface Props {
	data: HoldData;
}

export function DataRefViewById({ hold, dataId }: PropsById) {
	const data = hold.datas.get(dataId ?? -1);

	if (!data) {
		return <span className="is-muted">None</span>;
	}

	return <DataRefView data={ data } />

}

export default function DataRefView({data}: Props) {
	const name = useSignalUpdatableValue(data.name, true);
	const { format } = useSignalUpdatableValue(data.details, true);

	return (
		<div title={`${data.id}: ${name}`}>
			<span className="icon">
				<i className={`fas ${getDataIconClass(format)}`}></i>
			</span>{" "}
			{getFormatName(format)}
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
