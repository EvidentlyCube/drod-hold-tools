import {Grid, Paper, Theme, Typography} from "@material-ui/core";
import {createStyles, withStyles, WithStyles} from "@material-ui/styles";
import React from "react";
import {Hold} from "../../data/Hold";
import {DateUtils} from "../../common/DateUtils";

const styles = (theme: Theme) => createStyles({
	section: {
		marginBottom: theme.spacing(3),
	},
	content: {
		padding: theme.spacing(4, 6),
	},
	holdTitle: {
		padding: theme.spacing(4, 6),
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
	},
	gridStat: {
		padding: theme.spacing(0, 2),
	},
});

const GridStat = ({className, name, value}: { className: string, name: string, value: number }) => (
	<Grid item container lg={4} className={className} justifyContent="space-between">
		<strong>{name}:</strong>
		<span>{value}</span>
	</Grid>
);


interface HoldSummaryProps extends WithStyles<typeof styles> {
	hold: Hold;
}

interface HoldSummaryState {
}

class HoldSummary extends React.Component<HoldSummaryProps, HoldSummaryState> {
	constructor(props: Readonly<HoldSummaryProps> | HoldSummaryProps) {
		super(props);

		this.state = {};
	}

	render() {
		const {hold, classes} = this.props;

		return <Grid container spacing={5} className={classes.section}>
			<Grid item lg={6}>
				<Paper className={classes.holdTitle}>
					<Typography variant="h5" noWrap align="center">
						{hold.name}
					</Typography>
					<Typography variant="subtitle1" noWrap align="center">
						by <strong>{hold.author.name}</strong>
					</Typography>
					<div style={{flex: 1}}/>
					<Grid container justifyContent="space-between">
						<Grid item>
							<Typography variant="body2" color="textSecondary">
								<strong>Created:</strong> {DateUtils.formatDateTime(hold.dateCreated)}
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant="body2" color="textSecondary">
								<strong>Updated:</strong> {DateUtils.formatDateTime(hold.dateUpdated)}
							</Typography>
						</Grid>
					</Grid>
				</Paper>
			</Grid>
			<Grid item lg={6}>
				<Paper className={classes.content}>
					<Typography variant="h5" gutterBottom>
						Stats:
					</Typography>
					<Grid container>
						<GridStat className={classes.gridStat} name="Levels" value={hold.levels.size}/>
						<GridStat className={classes.gridStat} name="Rooms" value={hold.rooms.size}/>
						<GridStat className={classes.gridStat} name="Entrances" value={hold.entrances.size}/>
						<GridStat className={classes.gridStat} name="Custom Chars" value={hold.characters.size}/>
						<GridStat className={classes.gridStat} name="Monsters" value={hold.counts.monsters}/>
						<GridStat className={classes.gridStat} name="Characters" value={hold.counts.characters}/>
						<GridStat className={classes.gridStat} name="Scrolls" value={hold.counts.scrolls}/>
						<GridStat className={classes.gridStat} name="Speeches" value={hold.speeches.size}/>
						<GridStat className={classes.gridStat} name="Variables" value={hold.vars.size}/>
					</Grid>
				</Paper>
			</Grid>
		</Grid>;
	}
}

export default withStyles(styles)(HoldSummary);