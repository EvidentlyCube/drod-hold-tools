import { NavLink, Outlet } from "react-router-dom";
import { HoldReader } from "../../processor/HoldReader";
import { Hold } from "../../data/datatypes/Hold";

interface Props {
	hold: Hold;
	holdReader: HoldReader;
}

export default function HoldViewTemplate({ hold, holdReader }: Props) {
	return (
		<div className="columns mt-2">
			<div className="column is-10 is-offset-1">
				<div className="navbar">
					<div className="navbar-start">
						<NavLink className="navbar-item" to={`/hold/${holdReader.id}`} end>
							Summary
						</NavLink>
						<NavLink className="navbar-item" to={`/hold/${holdReader.id}/speeches`}>
							Speeches
						</NavLink>
						<NavLink className="navbar-item" to={`/hold/${holdReader.id}/changes`}>
							Changes
						</NavLink>
					</div>
				</div>
				<Outlet />
			</div>
		</div>
	);
}
