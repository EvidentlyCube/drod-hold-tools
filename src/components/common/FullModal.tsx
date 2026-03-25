import { ReactNode } from "react"

interface Props {
	title: ReactNode;
	children: ReactNode;
	buttons?: ReactNode;
	onClose: () => void;
	canClose?: boolean;
}
export default function FullModal({ title, children,buttons, onClose, canClose = true }: Props) {
	const closeCallback = canClose ? onClose : undefined;

	return <div className="modal is-active">
		<div className="modal-background" onClick={closeCallback}></div>
		<div className="modal-card">
			<header className="modal-card-head">
				<p className="modal-card-title">{title}</p>
				<button className="delete" onClick={closeCallback} disabled={!canClose}></button>
			</header>
			<section className="modal-card-body">
				<div className="content">
					{children}
				</div>
			</section>
			<footer className="modal-card-foot">
				<div className="buttons is-flex-grow-1">
					{buttons}
					<span className="is-flex-grow-1"></span>
					<button onClick={closeCallback} className="button" disabled={!canClose}>Cancel</button>
				</div>
			</footer>
		</div>
	</div>
}