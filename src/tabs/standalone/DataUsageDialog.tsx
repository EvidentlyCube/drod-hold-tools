import { AppBar, Box, Dialog, IconButton, List, ListItem, ListItemText, Toolbar } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Data } from "../../data/Data";

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
				{(data?.links ?? []).map(link => <ListItem>
					<ListItemText>{link.field}</ListItemText>
				</ListItem>)}
			</List>
		</Box>;
	</Dialog>

}