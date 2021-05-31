import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {AppBar, Box, Button, ButtonGroup, CssBaseline, Divider, makeStyles, Tab, Tabs, Toolbar} from "@material-ui/core";
import {Store} from "./data/Store";
import HoldTab from "./tabs/HoldTab";
import SpeechTab from "./tabs/SpeechTab";
import {Container} from "@material-ui/core/";

const useStyles = makeStyles(theme => ({
	tab: {
		...theme.mixins.toolbar,
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	footer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	footerButton: {
		textTransform: 'none',
	},
}));

function TabPanel(props: React.PropsWithChildren<{ value: any, index: any, className: string }>) {
	const {children, value, index, className} = props;

	if (value !== index) {
		return null;
	}

	return (
		<Container
			className={className}
			role="tabpanel"
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
		>
			<Box>{children}</Box>
		</Container>
	);
}

function App() {
	const classes = useStyles();
	const [hasLoadedHold, setHasLoadedHold] = useState(false);
	const [selectedTab, setSelectedTab] = useState(0);
	const onHoldLoaded = useCallback(() => {
		setHasLoadedHold(Store.loadedHold.value.isLoaded);
	}, [setHasLoadedHold]);

	useEffect(() => {
		Store.loadedHold.addListener(onHoldLoaded);
		return () => Store.loadedHold.removeListener(onHoldLoaded);
	}, [onHoldLoaded, setHasLoadedHold]);

	const handleChange = (event: React.ChangeEvent<{}>, newValue: any) => {
		setSelectedTab(newValue);
	};

	return (
		<div>
			<CssBaseline/>
			<AppBar position="static">
				<Tabs value={selectedTab} onChange={handleChange} aria-label="simple tabs example">
					<Tab label="Hold"/>
					<Tab label="Speeches" disabled={!hasLoadedHold}/>
				</Tabs>
			</AppBar>
			<TabPanel className={classes.tab} value={selectedTab} index={0}>
				<HoldTab/>
			</TabPanel>
			<TabPanel className={classes.tab} value={selectedTab} index={1}>
				<SpeechTab/>
			</TabPanel>
			<Divider/>
			<Container>
				<Toolbar className={classes.footer}>
					<ButtonGroup variant="text">
						<Button className={classes.footerButton} href="https://www.evidentlycube.com">by Maurycy Zarzycki</Button>
						<Button className={classes.footerButton} href="https://github.com/EvidentlyCube/drod-hold-tools">GitHub</Button>
					</ButtonGroup>
				</Toolbar>
			</Container>
		</div>
	);
}

export default App;
