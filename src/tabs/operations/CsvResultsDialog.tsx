import {AppBar, Dialog, IconButton, List, ListItem, ListItemText, Slide, Theme, Toolbar, Typography} from "@material-ui/core";
import {TransitionProps} from "@material-ui/core/transitions";
import CloseIcon from '@material-ui/icons/Close';
import {makeStyles} from "@material-ui/styles";
import React from "react";
import {CsvImportResult} from "../../common/operations/CsvImporter";

const useStyles = makeStyles((theme: Theme) => ({
	error: {
		paddingLeft: theme.spacing(6) + ' !important',
		backgroundColor: '#FEE',
	},
}));

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children?: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});


interface CsvResultsDialogProps {
	results?: CsvImportResult;
	onClose: () => void;
}

export const CsvResultsDialog = ({results, onClose}: CsvResultsDialogProps) => {
	const classes = useStyles();

	return <Dialog
		fullScreen
		open={!!results}
		onClose={onClose}
		TransitionComponent={Transition}
	>
		<AppBar sx={{position: 'relative'}}>
			<Toolbar>
				<IconButton
					edge="start"
					color="inherit"
					onClick={onClose}
					aria-label="close"
				>
					<CloseIcon/>
				</IconButton>
				<Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
					Csv Import Results
				</Typography>
			</Toolbar>
		</AppBar>
		<List>
			{results?.importedRows !== -1 && <ListItem>
                <ListItemText>
                    <strong>Imported rows:</strong> {results?.importedRows}
                </ListItemText>
            </ListItem>}
			{results?.skippedRows !== -1 && <ListItem>
                <ListItemText>
                    <strong>Rows without changes:</strong> {results?.skippedRows}
                </ListItemText>
            </ListItem>}
			<ListItem>
				<ListItemText>
					<strong>Errors:</strong> {results?.errors.length}
				</ListItemText>
			</ListItem>
			{results?.errors.map(error => (
				<ListItem className={classes.error}>
					<ListItemText>{error}</ListItemText>
				</ListItem>
			))}
		</List>
	</Dialog>;
};