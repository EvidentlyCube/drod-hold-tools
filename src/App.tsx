import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {AppBar, Box, Button, ButtonGroup, CssBaseline, Divider, Tab, Tabs, ThemeProvider, Toolbar} from "@material-ui/core";
import {makeStyles} from '@material-ui/styles';
import {createTheme} from '@material-ui/core/styles';
import {Store} from "./data/Store";
import HoldTab from "./tabs/HoldTab";
import SpeechTab from "./tabs/standalone/SpeechTab";
import {Container} from "@material-ui/core/";
import "./common.d.ts";
import EntrancesTab from "./tabs/standalone/EntrancesTab";
import ScrollsTab from "./tabs/standalone/ScrollsTab";
import MiscTab from "./tabs/misc/MiscTab";
import AuthorsTab from './tabs/standalone/PlayersTab';
import {LevelsTab} from './tabs/standalone/LevelsTab';
import {SystemMessages} from './common/components/SystemMessages';
import {LocalizationProvider} from "@material-ui/lab";
import AdapterDateFns from "@material-ui/lab/AdapterDateFns";


const theme = createTheme({
	palette: {
		secondary: {
			main: '#f50057',
		},
	},
});

const useStyles = makeStyles(() => ({
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
			maxWidth="xl"
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
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<CssBaseline/>
					<AppBar position="static">
						<Tabs value={selectedTab} onChange={handleChange} textColor="inherit" variant="fullWidth">
							<Tab label="Hold"/>
							<Tab label="Commands Text" disabled={!hasLoadedHold}/>
							<Tab label="Entrances" disabled={!hasLoadedHold}/>
							<Tab label="Scrolls" disabled={!hasLoadedHold}/>
							<Tab label="Players" disabled={!hasLoadedHold}/>
							<Tab label="Levels" disabled={!hasLoadedHold}/>
							<Tab label="Misc" disabled={!hasLoadedHold}/>
						</Tabs>
					</AppBar>
					<TabPanel className={classes.tab} value={selectedTab} index={0}>
						<HoldTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={1}>
						<SpeechTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={2}>
						<EntrancesTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={3}>
						<ScrollsTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={4}>
						<AuthorsTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={5}>
						<LevelsTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={6}>
						<MiscTab/>
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
				</LocalizationProvider>
				<SystemMessages/>
			</ThemeProvider>
		</div>
	);
}

export default App;
