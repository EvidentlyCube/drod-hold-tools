import { useSignalArrayThrottled } from "../../hooks/useSignalArrayThrottled";
import { useSignalValue } from "../../hooks/useSignalValue";
import { HoldReader } from "../../processor/HoldReader";
import FullPageMessage from "../common/FullPageMessage";
import HoldReaderErrorPage from "./HoldReaderErrorPage";
import HoldViewTemplate from "./HoldViewTemplate";

interface Props {
	holdReader: HoldReader;
}

export default function HoldReaderView({ holdReader }: Props) {
	const logs = useSignalArrayThrottled(holdReader.logs, 100);
	const error = useSignalValue(holdReader.error);

	console.log(error);

	if (error) {

		return (
			<HoldReaderErrorPage id={holdReader.id} error={error} />
		);
	} else if (!holdReader.sharedState.hold) {
		return (
			<FullPageMessage header="Status">
				<pre>{logs[logs.length - 1]}</pre>
			</FullPageMessage>
		);
	} else {
		return (
			<HoldViewTemplate
				hold={holdReader.sharedState.hold}
				holdReader={holdReader}
			/>
		);
	}
}
