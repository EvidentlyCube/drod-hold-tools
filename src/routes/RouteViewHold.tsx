import { Navigate, useParams } from "react-router-dom";
import HoldReaderView from "../components/viewHold/HoldReaderView";
import { HoldReaders } from "../processor/HoldReaders";


export default function RouteViewHold() {
	const { holdReaderId } = useParams();
	const id = parseInt(holdReaderId ?? "0");

	if (!id) {
		return <Navigate to="/" />;
	}

	const holdReader = HoldReaders.getById(id);

	if (!holdReader) {
		return <Navigate to="/" />;

	} else {
		return <HoldReaderView holdReader={holdReader} />;
	}
}