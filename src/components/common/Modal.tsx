import type { ReactNode } from "react";

interface Props {
	children: ReactNode;
	onClose: () => void;
	canClose?: boolean;
}
export default function Modal({ children, onClose, canClose = true }: Props) {
	return (
		<div className="modal is-active">
			{canClose && (
				<button
					type="button"
					className="modal-background"
					onClick={onClose}
				></button>
			)}
			<div className="modal-content">{children}</div>
			{canClose && (
				<button
					type="button"
					className="modal-close is-large"
					onClick={onClose}
				></button>
			)}
		</div>
	);
}
