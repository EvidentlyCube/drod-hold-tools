import type { ReactNode } from "react";

interface Props {
	title: ReactNode;
	children: ReactNode;
	buttons?: ReactNode;
	onClose: () => void;
	canClose?: boolean;
	modalBodyClassName?: string;
	contentClassName?: string;
}
export default function Modal({
	title,
	children,
	buttons,
	onClose,
	canClose = true,
	modalBodyClassName = "",
	contentClassName = "",
}: Props) {
	const closeCallback = canClose ? onClose : undefined;

	return (
		<div className="modal is-active">
			<button
				type="button"
				className="modal-background"
				onClick={closeCallback}
			></button>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">{title}</p>
					<button
						type="button"
						className="delete"
						onClick={closeCallback}
						disabled={!canClose}
					></button>
				</header>
				<section className={`modal-card-body ${modalBodyClassName}`}>
					<div className={`content ${contentClassName}`}>{children}</div>
				</section>
				<footer className="modal-card-foot">
					<div className="buttons is-flex-grow-1">
						{buttons}
						<span className="is-flex-grow-1"></span>
						<button
							type="button"
							onClick={closeCallback}
							className="button"
							disabled={!canClose}
						>
							Cancel
						</button>
					</div>
				</footer>
			</div>
		</div>
	);
}
