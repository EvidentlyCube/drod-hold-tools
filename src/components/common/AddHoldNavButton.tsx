import { useNavigate } from "react-router-dom";
import { HoldReaders } from "../../processor/HoldReaders";
import { ChangeEvent, useCallback } from "react";

export default function AddHoldNavButton() {
	const navigate = useNavigate();
	const onFileSelected = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files ? e.target.files[0] : null;

		if (file) {
			const reader = HoldReaders.readHoldFile(file);

			navigate(`/hold/${reader.id}`);
		}
	}, [navigate]);

	return (
		<div className="navbar-item add-item">
			Add Hold
			<input type="file" onChange={onFileSelected} />
		</div>
	);
}
