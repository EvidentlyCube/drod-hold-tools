import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import NavBarEnd from "./components/common/NavBarEnd";
import NavHoldsList from "./components/common/NavHoldsList";
import RouteHome from "./routes/RouteHome";
import RouteViewHold from "./routes/RouteViewHold";
import RouteViewHoldChanges from "./routes/viewHold/RouteViewHoldChanges";
import RouteViewHoldCharacters from "./routes/viewHold/RouteViewHoldCharacters";
import RouteViewHoldDatas from "./routes/viewHold/RouteViewHoldDatas";
import RouteViewHoldEntrances from "./routes/viewHold/RouteViewHoldEntrances";
import RouteViewHoldLevels from "./routes/viewHold/RouteViewHoldLevels";
import RouteViewHoldPlayers from "./routes/viewHold/RouteViewHoldPlayers";
import RouteViewHoldScrolls from "./routes/viewHold/RouteViewHoldScrolls";
import RouteViewHoldSpeeches from "./routes/viewHold/RouteViewHoldSpeeches";
import RouteViewHoldSummary from "./routes/viewHold/RouteViewHoldSummary";
import RouteViewHoldWorldMaps from "./routes/viewHold/RouteViewHoldWorldMaps";
import RouteViewHoldVariables from "./routes/viewHold/RouteViewHoldVariables";

function App() {
	const href = window.location.href.toLocaleLowerCase();
	const isLocalhost = !!['localhost', '127.0.0.1'].find(str => href.includes(str));

	return (
		<>
			<BrowserRouter basename={isLocalhost ? '/' : '/drod-hold-tools'}>
				<div className="navbar is-info primary-navbar" role="navigation">
					<div className="navbar-brand">
						<div className="navbar-item">
							<strong>DROD Hold Tools</strong>
						</div>
					</div>
					<div className="navbar-start">
						<NavLink className="navbar-item" to="/">
							Home
						</NavLink>
						<NavHoldsList />
					</div>
					<NavBarEnd />
				</div>
				<Routes>
					<Route path="/" element={<RouteHome />} />
					<Route path="/hold/:holdReaderId" element={<RouteViewHold />}>
						<Route path="" element={<RouteViewHoldSummary />} />
						<Route path="characters" element={<RouteViewHoldCharacters />} />
						<Route path="datas" element={<RouteViewHoldDatas />} />
						<Route path="entrances" element={<RouteViewHoldEntrances />} />
						<Route path="levels" element={<RouteViewHoldLevels />} />
						<Route path="players" element={<RouteViewHoldPlayers />} />
						<Route path="scrolls" element={<RouteViewHoldScrolls />} />
						<Route path="speeches" element={<RouteViewHoldSpeeches />} />
						<Route path="world-maps" element={<RouteViewHoldWorldMaps />} />
						<Route path="variables" element={<RouteViewHoldVariables />} />
						<Route path="changes" element={<RouteViewHoldChanges />} />
					</Route>
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
