import { NavLink, Outlet } from "react-router-dom";
import { HoldReader } from "../../processor/HoldReader";
import { Hold } from "../../data/datatypes/Hold";

interface Props {
	hold: Hold;
	holdReader: HoldReader;
}

export default function HoldViewTemplate({ hold, holdReader }: Props) {
	return (
		<>
			<div className="navbar is-success">
				<div className="navbar-brand">
					<div className="navbar-item">
						<strong>{hold.name.finalValue}</strong>
					</div>
				</div>
				<div className="navbar-start">
					<NavLink className="navbar-item" to={`/hold/${holdReader.id}`} end>
						Summary
					</NavLink>
					<NavLink className="navbar-item" to={`/hold/${holdReader.id}/characters`}>
						Characters
					</NavLink>
					<NavLink className="navbar-item" to={`/hold/${holdReader.id}/datas`}>
						Datas
					</NavLink>
					<NavLink className="navbar-item" to={`/hold/${holdReader.id}/entrances`}>
						Entrances
					</NavLink>
					<NavLink className="navbar-item" to={`/hold/${holdReader.id}/levels`} >
						Levels
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
		</>
	);
}
