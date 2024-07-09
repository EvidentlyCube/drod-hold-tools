import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import NavHoldsList from "./components/common/NavHoldsList";
import RouteHome from "./routes/RouteHome";
import RouteViewHold from "./routes/RouteViewHold";
import RouteViewHoldSummary from "./routes/viewHold/RouteViewHoldSummary";
import RouteViewHoldSpeeches from "./routes/viewHold/RouteViewHoldSpeech";
import RouteViewHoldChanges from "./routes/viewHold/RouteViewHoldChanges";
import NavBarEnd from "./components/common/NavBarEnd";
import RouteViewHoldData from "./routes/viewHold/RouteViewHoldData";
import RouteViewHoldLevels from "./routes/viewHold/RouteViewHoldLevels";
import RouteViewHoldCharacters from "./routes/viewHold/RouteViewHoldCharacters";
import RouteViewHoldEntrances from "./routes/viewHold/RouteViewHoldEntrances";
import RouteViewHoldScrolls from "./routes/viewHold/RouteViewHoldScrolls";

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
						<Route path="datas" element={<RouteViewHoldData />} />
						<Route path="entrances" element={<RouteViewHoldEntrances />} />
						<Route path="levels" element={<RouteViewHoldLevels />} />
						<Route path="scrolls" element={<RouteViewHoldScrolls />} />
						<Route path="speeches" element={<RouteViewHoldSpeeches />} />
						<Route path="changes" element={<RouteViewHoldChanges />} />
					</Route>
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
