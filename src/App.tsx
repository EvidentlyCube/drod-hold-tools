import {AppBar, Button, ButtonGroup, CssBaseline, Divider, Tab, Tabs, ThemeProvider, ToggleButton, ToggleButtonGroup, Toolbar} from "@material-ui/core";
import {Container} from "@material-ui/core/";
import {createTheme} from '@material-ui/core/styles';
import {LocalizationProvider} from "@material-ui/lab";
import AdapterDateFns from "@material-ui/lab/AdapterDateFns";
import {makeStyles} from '@material-ui/styles';
import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import "./common.d.ts";
import {LightTooltip} from './common/components/LightTooltip';
import {SystemMessages} from './common/components/SystemMessages';
import {TabContainer} from './common/components/TabContainer';
import {useObservablePropertyState} from './common/Hooks';
import {IsBusyModal} from './components/IsBusyModal';
import {Store} from "./data/Store";
import {CoreMasterTab} from './tabs/core/CoreMasterTab';
import {DataMasterTab} from './tabs/core/DataMasterTab';
import {TextMasterTab} from './tabs/core/TextMasterTab';


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
		padding: theme.spacing(0, 0, 4) + " !important",
	},
	footer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	footerButton: {
		textTransform: 'none',
	},
}));

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
					<AppBar position="relative">
						<Tabs value={selectedTab} onChange={handleChange} textColor="inherit" variant="fullWidth">
							<Tab label="Main"/>
							<Tab label="Texts" disabled={!hasLoadedHold}/>
							<Tab label="Data" disabled={!hasLoadedHold}/>
							<Tab
								label={<LightTooltip title="Not yet available">
									<div>Analysis</div>
								</LightTooltip>}
								disabled={true}
								style={{pointerEvents: 'auto', flexGrow: 1}}
							/>
						</Tabs>
					</AppBar>
					<TabContainer className={classes.tab} value={selectedTab} index={0}>
						<CoreMasterTab hasLoadedHold={hasLoadedHold}/>
					</TabContainer>
					<TabContainer className={classes.tab} value={selectedTab} index={1}>
						<TextMasterTab hasLoadedHold={hasLoadedHold}/>
					</TabContainer>
					<TabContainer className={classes.tab} value={selectedTab} index={2}>
						<DataMasterTab hasLoadedHold={hasLoadedHold}/>
					</TabContainer>
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
