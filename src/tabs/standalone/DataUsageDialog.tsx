import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from "@material-ui/core";
import { useEffect, useState } from "react";
import { SortUtils } from "../../common/SortUtils";
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

export const DataUsageDialog = ({ data, onClose }: DataUsageDialogProps) => {
	const [links, setLinks] = useState<string[]>([]);

	useEffect(() => {
		const sortedLinks = data?.links.map(x => x.description) || [];
		sortedLinks.sort(SortUtils.naturalSort);
		setLinks(sortedLinks)

	}, [setLinks, data]);

	return <Dialog open={!!data} onClose={onClose} maxWidth="lg">
		<DialogTitle>
			Usage of: {data?.changes.name ?? data?.name}
		</DialogTitle>
		<DialogContent dividers>
			<List>
				{links.map((link, index) => <ListItem key={index}>
					<ListItemText>{link}</ListItemText>
				</ListItem>)}
			</List>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose} color="primary" autoFocus>
				Close
			</Button>
		</DialogActions>
	</Dialog>;

};