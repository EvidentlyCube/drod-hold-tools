import {AppBar, Box, Dialog, IconButton, List, ListItem, ListItemText, Toolbar} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {Data} from "../../data/Data";
import {useEffect, useState} from "react";
import {SortUtils} from "../../common/SortUtils";

interface DataUsageDialogProps {
	data?: Data;
	onClose: () => void;
}

const totalStyle = {
	display: 'flex',
	flex: '1',
	justifyContent: 'center',
	alignItems: 'center',
	paddingTop: '64px',
};

export const DataUsageDialog = ({data, onClose}: DataUsageDialogProps) => {
	const [links, setLinks] = useState<string[]>([]);

	useEffect(() => {
		const sortedLinks = data?.links.map(x => x.description) || [];
		sortedLinks.sort(SortUtils.naturalSort);
		setLinks(sortedLinks)

	}, [setLinks, data]);

	return <Dialog open={!!data} fullScreen onClose={onClose}>
		<AppBar>
			<Toolbar>
				<IconButton edge="start" color="inherit" onClick={onClose}>
					<Close/>
				</IconButton>
				Usage of: {data?.changes.name ?? data?.name}
			</Toolbar>
		</AppBar>
		<Box style={totalStyle}>
			<List>
				{links.map((link, index) => <ListItem key={index}>
					<ListItemText>{link}</ListItemText>
				</ListItem>)}
			</List>
		</Box>;
	</Dialog>;

};