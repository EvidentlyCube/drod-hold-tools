import {AppBar, Tab, Tabs, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import {useCallback, useState} from "react";
import {LightTooltip} from "../../common/components/LightTooltip";
import {TabContainer} from "../../common/components/TabContainer";
import DataTab from "../standalone/DataTab";

const useStyles = makeStyles((theme: Theme) => ({
	tab: {
		...theme.mixins.toolbar,
		paddingTop: theme.spacing(4),
	},
	bar: {
		opacity: 0.8,
	},
}));

interface DataMasterTabProps {
	hasLoadedHold: boolean;
}

export const DataMasterTab = (props: DataMasterTabProps) => {
	const {hasLoadedHold} = props;
	const classes = useStyles();

	const [selectedTab, setSelectedTab] = useState(0);
	const handleChange = useCallback((event: React.ChangeEvent<{}>, newValue: any) => {
		setSelectedTab(newValue);
	}, [setSelectedTab]);

	return <>
		<AppBar position="relative" className={classes.bar}>
			<Tabs value={selectedTab} onChange={handleChange} textColor="inherit" variant="fullWidth">
				<Tab label="All Data" disabled={!hasLoadedHold}/>
				<Tab
					label={<LightTooltip title="Not yet available">
						<div>Speech</div>
					</LightTooltip>}
					disabled={true}
					style={{pointerEvents: 'auto', flexGrow: 1}}
				/>
			</Tabs>
		</AppBar>
		<TabContainer className={classes.tab} value={selectedTab} index={0}>
			<DataTab/>
		</TabContainer>
	</>;
};