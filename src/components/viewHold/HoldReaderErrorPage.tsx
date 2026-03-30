import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HoldReaders } from "../../processor/HoldReaders";
import FullPageMessage from "../common/FullPageMessage";

interface Props {
	id: number;
	error: string;
}

export default function HoldReaderErrorPage({ id, error }: Props) {
	const navigate = useNavigate();
	const onDelete = useCallback(() => {
		HoldReaders.deleteById(id);
		navigate("/");
	}, [navigate, id]);

	return (
		<FullPageMessage header="Error!">
			<p>{error}</p>
			<button type="button" className="button is-danger" onClick={onDelete}>
				Delete
			</button>
		</FullPageMessage>
	);
}
