import { DataFormat } from "../../data/DrodEnums";
import {
	getFormatName
} from "../../data/Utils";
import { Hold } from "../../data/datatypes/Hold";
import { HoldData } from "../../data/datatypes/HoldData";
import { useSignalUpdatableValue } from "../../hooks/useSignalUpdatableValue";
import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";

interface PropsById {
	hold: Hold;
	dataId?: number;
	showName?: boolean;
}
interface PropsByIdDynamic {
	hold: Hold;
	dataIdSource: SignalUpdatableValue<number|undefined>;
	showName?: boolean;
}

interface Props {
	data: HoldData;
	showName?: boolean;
}

export function DataRefViewById({ hold, dataId, showName }: PropsById) {
	const data = hold.datas.get(dataId ?? -1);

	if (!data) {
		return <span className="is-muted">None</span>;
	}

	return <DataRefView data={ data } showName={showName} />
}
export function DataRefViewByIdDynamic({ hold, dataIdSource, showName }: PropsByIdDynamic) {
	const dataId = useSignalUpdatableValue(dataIdSource, true);
	const data = hold.datas.get(dataId ?? -1);

	if (!data) {
		return <span className="is-muted">None</span>;
	}

	return <DataRefView data={ data } showName={showName} />
}

export default function DataRefView({data, showName}: Props) {
	const name = useSignalUpdatableValue(data.name, true);
	const { format } = useSignalUpdatableValue(data.details, true);

	return (
		<div title={`${data.id}: ${name}`}>
			<span className="icon">
				<i className={`fas ${getDataIconClass(format)}`}></i>
			</span>{" "}
			{showName && data.name.newValue}
			{!showName && getFormatName(format)}
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
