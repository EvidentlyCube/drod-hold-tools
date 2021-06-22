import {AppBar, Dialog, IconButton, Slide, Toolbar, Typography} from "@material-ui/core";
import {TransitionProps} from "@material-ui/core/transitions";
import CloseIcon from '@material-ui/icons/Close';
import {makeStyles} from "@material-ui/styles";
import React, {useCallback} from "react";
import {SearchReplaceResultRow, SearchReplaceUtils} from "../../common/operations/SearchReplaceUtils";
import {EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
import {EnchancedTable} from "../../common/components/EnchancedTable";
import {Button} from "@material-ui/core/";
import {Hold} from "../../data/Hold";

const useStyles = makeStyles(() => ({
	table: {
		'& em': {
			background: 'yellow',
			boxShadow: '0 1px 2px black',
			padding: '0 1px',
			margin: '0 2px',
			fontStyle: 'normal',
		},
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

interface ResultsRow {
	id: number;
	oldValue: string;
	newValue: string;
}

interface SearchReplaceResultsDialogProps {
	results?: SearchReplaceResultRow[];
	hold: Hold;
	onClose: () => void;
}

const renderCell = (row: ResultsRow, field: 'oldValue' | 'newValue') => {
	return <div dangerouslySetInnerHTML={{__html: row[field]}}/>;
};
const columns: EnchancedTableColumn[] = [
	{id: 'id', label: 'id', visible: false},
	{id: 'oldValue', label: 'Old Text', renderCell, cellClassName: 'tommable'},
	{id: 'newValue', label: 'New Text', renderCell, cellClassName: 'tommable'},
];

export const SearchReplaceResultsDialog = ({results, hold, onClose}: SearchReplaceResultsDialogProps) => {
	const classes = useStyles();

	const rows: ResultsRow[] = results?.map((entry, index) => ({
		id: index,
		oldValue: entry.oldHtml,
		newValue: entry.newHtml,
	})) ?? [];

	const onSave = useCallback(() => {
		SearchReplaceUtils.commit(results ?? [], hold);
		onClose();
	}, [results, onClose, hold])

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
					Search replace preview
				</Typography>
				<Button autoFocus color="inherit" onClick={onSave}>
					save
				</Button>
			</Toolbar>
		</AppBar>
		<EnchancedTable
			className={classes.table}
			idField="id"
			rows={rows}
			columns={columns}/>
	</Dialog>;
};