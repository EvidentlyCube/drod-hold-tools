import { AppBar, Tab, Tabs, Theme } from "@material-ui/core"
import { makeStyles } from "@material-ui/styles";
import { useCallback, useState } from "react";
import { TabContainer } from "../../common/components/TabContainer";
import HoldTab from "../holdTab/HoldTab";
import MiscTab from "../misc/MiscTab";
import OperationTab from "../operations/OperationsTab";
import EntrancesTab from "../standalone/EntrancesTab";
import { LevelsTab } from "../standalone/LevelsTab";
import PlayersTab from "../standalone/PlayersTab";
import ScrollsTab from "../standalone/ScrollsTab";
import SpeechTab from "../standalone/SpeechTab";

const useStyles = makeStyles((theme: Theme) => ({
	tab: {
		...theme.mixins.toolbar,
		paddingTop: theme.spacing(4),
	},
	bar: {
		opacity: 0.8
	}
}));


interface TextMasterTabProps {
	hasLoadedHold: boolean;
}

export const TextMasterTab = (props: TextMasterTabProps) => {
	const { hasLoadedHold } = props;
	const classes = useStyles();

	const [selectedTab, setSelectedTab] = useState(0);
	const handleChange = useCallback((event: React.ChangeEvent<{}>, newValue: any) => {
		setSelectedTab(newValue);
	}, [setSelectedTab]);

	return <>
		<AppBar position="relative" className={classes.bar}>
			<Tabs value={selectedTab} onChange={handleChange} textColor="inherit" variant="fullWidth">
				<Tab label="Commands Text" disabled={!hasLoadedHold} />
				<Tab label="Entrances" disabled={!hasLoadedHold} />
				<Tab label="Scrolls" disabled={!hasLoadedHold} />
				<Tab label="Players" disabled={!hasLoadedHold} />
				<Tab label="Levels" disabled={!hasLoadedHold} />
				<Tab label="Misc" disabled={!hasLoadedHold} />
			</Tabs>
		</AppBar>
		<TabContainer className={classes.tab} value={selectedTab} index={0}>
			<SpeechTab />
		</TabContainer>
		<TabContainer className={classes.tab} value={selectedTab} index={1}>
			<EntrancesTab />
		</TabContainer>
		<TabContainer className={classes.tab} value={selectedTab} index={2}>
			<ScrollsTab />
		</TabContainer>
		<TabContainer className={classes.tab} value={selectedTab} index={3}>
			<PlayersTab />
		</TabContainer>
		<TabContainer className={classes.tab} value={selectedTab} index={4}>
			<LevelsTab />
		</TabContainer>
		<TabContainer className={classes.tab} value={selectedTab} index={5}>
			<MiscTab />
		</TabContainer>

	</>
}