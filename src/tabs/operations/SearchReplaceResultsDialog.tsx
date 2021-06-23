import {AppBar, Checkbox, Dialog, IconButton, Slide, Toolbar, Typography} from "@material-ui/core";
import {TransitionProps} from "@material-ui/core/transitions";
import CloseIcon from '@material-ui/icons/Close';
import {makeStyles} from "@material-ui/styles";
import React, {useCallback} from "react";
import {SearchReplaceResultRow, SearchReplaceUtils} from "../../common/operations/SearchReplaceUtils";
import {EnchancedTableApi, EnchancedTableColumn} from "../../common/components/EnchancedTableCommons";
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
		'& .muted .tommable': {
			opacity: 0.5,
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
	include: boolean;
	newHtml: string;
	oldHtml: string;
}

interface SearchReplaceResultsDialogProps {
	results?: SearchReplaceResultRow[];
	hold: Hold;
	onClose: () => void;
}

const renderCell = (row: ResultsRow, field: 'newHtml' | 'oldHtml') => {
	return <div dangerouslySetInnerHTML={{__html: row[field]}}/>;
};

const onToggleInclude = (row: ResultsRow, api: EnchancedTableApi) => {
	row.include = !row.include;
	api.rerenderRow(row.id);
};

const renderIncludeCell = (row: ResultsRow, field: string, api: EnchancedTableApi) => {
	return <Checkbox
		checked={row.include}
		onChange={() => onToggleInclude(row, api)}
	/>;
};

const getRowClassName = (row: ResultsRow) => {
	return !row.include ? 'muted' : '';
};

const columns: EnchancedTableColumn[] = [
	{id: 'id', label: 'id', visible: false},
	{id: 'include', label: 'Include', renderCell: renderIncludeCell, width: '10%'},
	{id: 'oldHtml', label: 'Old Text', renderCell, cellClassName: 'tommable', width: '40%'},
	{id: 'newHtml', label: 'New Text', renderCell, cellClassName: 'tommable', width: '40%'},
];
export const SearchReplaceResultsDialog = ({results, hold, onClose}: SearchReplaceResultsDialogProps) => {
	const classes = useStyles();

	const onSave = useCallback(() => {
		SearchReplaceUtils.commit(results ?? [], hold);
		onClose();
	}, [results, onClose, hold]);


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
					Do Replace
				</Button>
			</Toolbar>
		</AppBar>
		<EnchancedTable
			className={classes.table}
			idField="id"
			rows={results ?? []}
			columns={columns}
			getRowClassName={getRowClassName}/>
	</Dialog>;
};