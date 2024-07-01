import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import NavHoldsList from "./components/common/NavHoldsList";
import RouteHome from "./routes/RouteHome";
import RouteViewHold from "./routes/RouteViewHold";
import RouteViewHoldSummary from "./routes/viewHold/RouteViewHoldSummary";
import RouteViewHoldSpeeches from "./routes/viewHold/RouteViewHoldSpeech";
import RouteViewHoldChanges from "./routes/viewHold/RouteViewHoldChanges";
import NavBarEnd from "./components/common/NavBarEnd";

function App() {
	return (
		<>
			<BrowserRouter>
				<div className="navbar is-info" role="navigation">
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
						<Route path="speeches" element={<RouteViewHoldSpeeches />} />
						<Route path="changes" element={<RouteViewHoldChanges />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
