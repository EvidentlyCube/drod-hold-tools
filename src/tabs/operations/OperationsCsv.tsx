import { Box, Button, Paper, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useCallback, useState } from "react";
import { CsvExporter } from "../../common/operations/CsvExporter";
import { CsvImporter, CsvImportResult } from "../../common/operations/CsvImporter";
import { Hold } from "../../data/Hold";
import { Store } from "../../data/Store";
import { CsvResultsDialog } from "./CsvResultsDialog";
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

    const [results, setResults] = useState<CsvImportResult|undefined>(undefined);

    const onClose = useCallback(() => setResults(undefined), [setResults]);

    const onExport = useCallback(() => {
	    Store.isBusy.value = true;

        const csv = CsvExporter.hold(hold);

        var downloader = document.createElement("a");
        downloader.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv);
        downloader.setAttribute("download", hold.name + '.csv');
        downloader.click();

	    Store.isBusy.value = false;
    }, [hold]);

    const onImport = useCallback(async (files: File[]) => {
    	const result = await CsvImporter.readFile(files[0], hold);
        setResults(result);
    }, [hold, setResults]);

    return <Paper className={classes.container}>
        <Typography variant="h5" noWrap>
            CSV Export/Import
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
            You can export all texts from the hold and edit and inspect them in Microsoft Excel,
            Google Sheets, LibreOffice Calc or any other editor that supports CSV file. 
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
            The export will consist of six columns. The first three are the important information:
            type of the data, unique identifier and the value itself. The remaining three
            columns contain additional information that will help you identify and locate
            the text. 
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
            <strong>Only ever change the third column, <code>value</code></strong>. Otherwise
            the import may fail. Feel free to remove or reorder row. After you finish the import 
            you'll be presented with a short report telling you the number of changes, number of 
            rows which didn't modify anything and the list of errors. 
        </Typography>
        <div style={{ flex: 1 }} />
        <Box display="flex" justifyContent="space-around" className={classes.buttons}>
            <Button variant="contained" onClick={onExport}>Export CSV</Button>
            <DropzoneCsv onDrop={onImport}/>
        </Box>
        <CsvResultsDialog results={results} onClose={onClose} />
    </Paper>;
}