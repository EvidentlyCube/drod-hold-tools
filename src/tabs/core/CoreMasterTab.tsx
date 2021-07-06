import {AppBar, Tab, Tabs, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import {useCallback, useState} from "react";
import {TabContainer} from "../../common/components/TabContainer";
import HoldTab from "../holdTab/HoldTab";
import OperationTab from "../operations/OperationsTab";

const useStyles = makeStyles((theme: Theme) => ({
	tab: {
		...theme.mixins.toolbar,
		paddingTop: theme.spacing(4),
	},
	bar: {
		opacity: 0.8,
	},
}));


interface CoreMasterTabProps {
	hasLoadedHold: boolean;
}

export const CoreMasterTab = (props: CoreMasterTabProps) => {
	const {hasLoadedHold} = props;
	const classes = useStyles();

	const [selectedTab, setSelectedTab] = useState(0);
	const handleChange = useCallback((event: React.ChangeEvent<{}>, newValue: any) => {
		setSelectedTab(newValue);
	}, [setSelectedTab]);

	return <>
		<AppBar position="relative" className={classes.bar}>
			<Tabs value={selectedTab} onChange={handleChange} textColor="inherit" variant="fullWidth">
				<Tab label="Hold"/>
				<Tab label="Operations" disabled={!hasLoadedHold}/>
			</Tabs>
		</AppBar>
		<TabContainer className={classes.tab} value={selectedTab} index={0}>
			<HoldTab/>
		</TabContainer>
		<TabContainer className={classes.tab} value={selectedTab} index={1}>
			<OperationTab/>
		</TabContainer>
	</>;
};