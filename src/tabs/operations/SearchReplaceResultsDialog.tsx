import { AppBar, Dialog, IconButton, List, ListItem, ListItemText, Slide, Theme, Toolbar, Typography } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from "@material-ui/styles";
import React from "react";
import { CsvImportResult } from "../../common/operations/CsvImporter";
import { SearchReplaceResultRow } from "../../common/operations/SearchReplaceUtils";

const useStyles = makeStyles((theme: Theme) => ({
	
}));

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children?: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});


interface SearchReplaceResultsDialogProps {
	results?: SearchReplaceResultRow[];
	onClose: () => void;
}

export const SearchReplaceResultsDialog = ({ results, onClose }: SearchReplaceResultsDialogProps) => {
	const classes = useStyles();

	return <Dialog
		fullScreen
		open={!!results}
		onClose={onClose}
		TransitionComponent={Transition}
	>
		<AppBar sx={{ position: 'relative' }}>
			<Toolbar>
				<IconButton
					edge="start"
					color="inherit"
					onClick={onClose}
					aria-label="close"
				>
					<CloseIcon />
				</IconButton>
				<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
					Search replace preview
			</Typography>
			</Toolbar>
		</AppBar>
		<List>
			{results?.map(row => (
				<ListItem>
					<ListItemText>{row.oldValue} -&gt; {row.newValue}</ListItemText>
				</ListItem>
			))}
		</List>
	</Dialog>
}