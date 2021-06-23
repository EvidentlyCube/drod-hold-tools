import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {AppBar, Box, Button, ButtonGroup, CssBaseline, Divider, Tab, Tabs, ThemeProvider, ToggleButton, ToggleButtonGroup, Toolbar} from "@material-ui/core";
import {makeStyles} from '@material-ui/styles';
import {createTheme} from '@material-ui/core/styles';
import {Store} from "./data/Store";
import HoldTab from "./tabs/holdTab/HoldTab";
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
import OperationsTab from './tabs/operations/OperationsTab';
import {useObservablePropertyState} from './common/Hooks';
import {IsBusyModal} from './components/IsBusyModal';
import DataTab from "./tabs/standalone/DataTab";


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
	const isBusy = useObservablePropertyState(Store.isBusy, false);
	const onHoldLoaded = useCallback(() => {
		setHasLoadedHold(Store.loadedHold.value.isLoaded);
	}, [setHasLoadedHold]);

	const [options, setOptions] = useState<string[]>(() => []);
	const onChangeOptions = useCallback((
		event: React.MouseEvent<HTMLElement>,
		newOptions: string[],
	) => {
		setOptions(newOptions);
		document.getElementsByTagName('body')[0].className = newOptions.indexOf('use-tom') !== -1
			? 'use-tom'
			: '';
	}, [setOptions]);
	useEffect(() => {
		Store.loadedHold.addListener(onHoldLoaded);
		return () => Store.loadedHold.removeListener(onHoldLoaded);
	}, [onHoldLoaded, setHasLoadedHold]);

	const handleChange = (event: React.ChangeEvent<{}>, newValue: any) => {
		setSelectedTab(newValue);
	};

	return (
		<div className={options.indexOf('use-tom') !== -1 ? 'use-tom' : ''}>
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
							<Tab label="Data" disabled={!hasLoadedHold}/>
							<Tab label="Misc" disabled={!hasLoadedHold}/>
							<Tab label="Operations" disabled={!hasLoadedHold}/>
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
						<DataTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={7}>
						<MiscTab/>
					</TabPanel>
					<TabPanel className={classes.tab} value={selectedTab} index={8}>
						<OperationsTab/>
					</TabPanel>
					<Divider/>
					<Container>
						<Toolbar className={classes.footer}>
							<ToggleButtonGroup value={options} onChange={onChangeOptions}>
								<ToggleButton value="use-tom">Use Tom's New Roman</ToggleButton>
							</ToggleButtonGroup>
						</Toolbar>
						<Toolbar className={classes.footer}>
							<ButtonGroup variant="text">
								<Button className={classes.footerButton} href="https://www.evidentlycube.com">by Maurycy Zarzycki</Button>
								<Button className={classes.footerButton} href="https://github.com/EvidentlyCube/drod-hold-tools">GitHub</Button>
							</ButtonGroup>
						</Toolbar>
					</Container>
				</LocalizationProvider>
				<SystemMessages/>
				<IsBusyModal open={isBusy}/>
			</ThemeProvider>
		</div>
	);
}

export default App;
