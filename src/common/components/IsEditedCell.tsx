import React, {useCallback} from "react";
import {Divider, IconButton, Theme, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import {History} from "@material-ui/icons";
import {LightTooltip} from "./LightTooltip";

const useStyles = makeStyles((theme: Theme) => ({
	undo: {
		textAlign: 'center',
	},
	divider: {
		marginBottom: theme.spacing(1),
	},
	small: {
		fontSize: '12px',
	},
}));

interface IsEditedCellProps {
	rowId: any;
	resetHandler: (rowId: any) => void;
	originalText?: string;
	label?: string;
}

interface TooltipContentsProps {
	originalText?: string;
}

const TooltipContents = (props: TooltipContentsProps) => {
	const {originalText} = props;
	const classes = useStyles();

	return <React.Fragment>
		<Typography component="p" variant="overline" className={classes.undo}><strong>Click to undo</strong></Typography>
		<Divider variant="middle" className={classes.divider}/>
		<Typography variant="body2" className={classes.small}>
			<strong>Original text:</strong>&nbsp;{originalText}
		</Typography>
	</React.Fragment>;
};

export const IsEditedCell = (props: IsEditedCellProps) => {
	const {originalText, label, rowId, resetHandler} = props;

	const onReset = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		resetHandler(rowId);

	}, [rowId, resetHandler]);

	const title = label
		? label
		: <TooltipContents originalText={originalText}/>;

	return <LightTooltip title={title}>
		<IconButton onClick={onReset}>
			<History color="primary"/>
		</IconButton>
	</LightTooltip>;
};