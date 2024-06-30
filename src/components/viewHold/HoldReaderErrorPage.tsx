import { useNavigate } from "react-router-dom";
import FullPageMessage from "../common/FullPageMessage";
import { useCallback } from "react";
import { HoldReaders } from "../../processor/HoldReaderManager";

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
			<button className="button is-danger" onClick={onDelete}>
				Delete
			</button>
		</FullPageMessage>
	);
}
