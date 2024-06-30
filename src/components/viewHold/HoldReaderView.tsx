import { useNavigate } from "react-router-dom";
import { HoldReader } from "../../processor/HoldReader";
import FullPageMessage from "../common/FullPageMessage";
import { useCallback } from "react";
import { HoldReaders } from "../../processor/HoldReaderManager";
import { useSignalArray } from "../../hooks/useSignalArray";
import HoldViewTemplate from "./HoldViewTemplate";
import HoldReaderErrorPage from "./HoldReaderErrorPage";

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
