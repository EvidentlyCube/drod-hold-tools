import { ReactElement } from "react";

interface Props {
	header?: string;
	children: ReactElement[] | ReactElement | string | number
}
export default function FullPageMessage({ header, children} : Props) {
	return <section className="hero is-fullheight">
		<div className="hero-body">
			<div className="container has-text-centered">
				{header && <h2 className="title is-2">{header}</h2>}
				{children}
			</div>
		</div>
	</section>;
}
