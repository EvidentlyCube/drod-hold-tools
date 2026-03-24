import { useSignalValue } from "../../hooks/useSignalValue";
import { useSignalValueThrottled } from "../../hooks/useSignalValueThrottled";
import { HoldReader } from "../../processor/HoldReaders";
import FullPageMessage from "../common/FullPageMessage";
import HoldReaderErrorPage from "./HoldReaderErrorPage";
import HoldViewTemplate from "./HoldViewTemplate";

interface Props {
	holdReader: HoldReader;
}

export default function HoldReaderView({ holdReader }: Props) {
	const lastLog = useSignalValueThrottled(holdReader.lastLog);
	const error = useSignalValue(holdReader.error);

	if (error) {
		return (
			<HoldReaderErrorPage id={holdReader.id} error={error} />
		);

	} else if (holdReader.isBusy.value) {
		return (
			<FullPageMessage header="Status">
				<pre>{lastLog}</pre>
			</FullPageMessage>
		);
	} else {
		return (
			<HoldViewTemplate
				hold={holdReader.hold}
				holdReader={holdReader}
			/>
		);
	}
}
