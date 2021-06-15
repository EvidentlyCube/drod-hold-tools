import { Box, Button, Paper, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useCallback } from "react";
import { CsvExporter } from "../../common/csv/CsvExporter";
import { Hold } from "../../data/Hold";
import { DropzoneCsv } from "./DropzoneCsv";

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        padding: theme.spacing(4, 6),
    },
    subtitle: {
        paddingBottom: theme.spacing(2)
    },
    buttons: {
        '& > *': {
            flex: '40% 0 0'
        }
    }
}));


interface OperationsCsvProps {
    hold: Hold;
}

export const OperationsCsv = (props: OperationsCsvProps) => {
    const classes = useStyles();
    const {hold} = props;

    const onExport = useCallback(() => {
        const csv = CsvExporter.hold(hold);

        console.log(csv);
        
        var a = document.createElement("a");
        a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
        a.setAttribute("download", hold.name + '.csv');
        a.click();
    }, [hold]);

    return <Paper className={classes.container}>
        <Typography variant="h5" noWrap>
            CSV Export/Import
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
            Lorem ipsum dolor
        </Typography>
        <div style={{ flex: 1 }} />
        <Box display="flex" justifyContent="space-around" className={classes.buttons}>
            <Button variant="contained" onClick={onExport}>Export CSV</Button>
            <DropzoneCsv onDrop={() => null}/>
        </Box>
    </Paper>;
}