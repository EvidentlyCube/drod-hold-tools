import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {AppBar, Box, CssBaseline, Tab, Tabs} from "@material-ui/core";
import {Store} from "./data/Store";
import HoldTab from "./tabs/HoldTab";
import SpeechTab from "./tabs/SpeechTab";

function TabPanel(props: React.PropsWithChildren<{value: any, index: any}>) {
	const { children, value, index } = props;

	if (value !== index) {
		return null;
	}

	return (
		<div
			role="tabpanel"
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
		>
			<Box>{children}</Box>
		</div>
	);
}

function App() {
	const [hasLoadedHold, setHasLoadedHold] = useState(false);
	const [selectedTab, setSelectedTab] = useState(0);
	const onHoldLoaded = useCallback(() => {
		setHasLoadedHold(Store.loadedHold.value.isLoaded);
	}, [setHasLoadedHold]);

	useEffect(() => {
		Store.loadedHold.addListener(onHoldLoaded);
		return () => Store.loadedHold.removeListener(onHoldLoaded);
	}, [onHoldLoaded, setHasLoadedHold])

	const handleChange = (event: React.ChangeEvent<{}>, newValue: any) => {
		setSelectedTab(newValue);
	};

	return (
		<div>
			<CssBaseline />
			<AppBar position="static">
				<Tabs value={selectedTab} onChange={handleChange} aria-label="simple tabs example">
					<Tab label="Hold" />
					<Tab label="Speeches" disabled={!hasLoadedHold} />
				</Tabs>
			</AppBar>
			<TabPanel value={selectedTab} index={0}>
				<HoldTab />
			</TabPanel>
			<TabPanel value={selectedTab} index={1}>
				<SpeechTab />
			</TabPanel>
		</div>
	);
}

export default App;
