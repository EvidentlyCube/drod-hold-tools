import { Box, Button, Paper, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useCallback } from "react";
import { CsvExporter } from "../../common/csv/CsvExporter";
import { CsvImporter } from "../../common/csv/CsvImporter";
import { Hold } from "../../data/Hold";
import { Store } from "../../data/Store";
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

        Store.isBusy.value = true;

        var downloader = document.createElement("a");
        downloader.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
        downloader.setAttribute("download", hold.name + '.csv');
        downloader.click();
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
            <DropzoneCsv onDrop={files => CsvImporter.readFile(files[0], hold)}/>
        </Box>
    </Paper>;
}