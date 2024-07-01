import { useSignalArray } from "../../hooks/useSignalArray";
import { HoldReader } from "../../processor/HoldReader";
import FullPageMessage from "../common/FullPageMessage";
import HoldReaderErrorPage from "./HoldReaderErrorPage";
import HoldViewTemplate from "./HoldViewTemplate";

interface Props {
	holdReader: HoldReader;
}

export default function HoldReaderView({ holdReader }: Props) {
	const logs = useSignalArray(holdReader.logs);

	if (holdReader.error) {
		return (
			<HoldReaderErrorPage id={holdReader.id} error={holdReader.error} />
		);
	} else if (!holdReader.sharedState.hold) {
		return (
			<FullPageMessage header="Status">
				<p>{logs[logs.length - 1]}</p>
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
