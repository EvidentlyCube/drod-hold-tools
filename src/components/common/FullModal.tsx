import type { ReactNode } from "react";

interface Props {
	title: ReactNode;
	children: ReactNode;
	buttons?: ReactNode;
	onClose: () => void;
	canClose?: boolean;
	bodyClassName?: string;
}
export default function FullModal({
	title,
	children,
	buttons,
	onClose,
	canClose = true,
	bodyClassName = "",
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
				<section className="modal-card-body">
					<div className={`content ${bodyClassName}`}>{children}</div>
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
