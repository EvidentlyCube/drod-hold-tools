import { ReactNode } from "react"

interface Props {
	children: ReactNode;
	onClose: () => void;
}
export default function Modal({children, onClose}: Props) {
	return <div className="modal is-active">
		<div className="modal-background" onClick={onClose}></div>
		<div className="modal-content">
			{children}
		</div>
		<button className="modal-close is-large" onClick={onClose}></button>
	</div>
}