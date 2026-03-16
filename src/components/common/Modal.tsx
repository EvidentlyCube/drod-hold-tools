import { ReactNode } from "react"

interface Props {
	children: ReactNode;
	onClose: () => void;
	canClose?: boolean;
}
export default function Modal({children, onClose, canClose = true}: Props) {
	return <div className="modal is-active">
		{canClose && <div className="modal-background" onClick={onClose}></div>}
		<div className="modal-content">
			{children}
		</div>
		{canClose && <button className="modal-close is-large" onClick={onClose}></button>}
	</div>
}