import { Box, Button, Paper, TextField, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useCallback, useState } from "react";
import { useTextInputState } from "../../common/Hooks";
import { SearchReplaceUtils, SearchReplaceResultRow } from "../../common/operations/SearchReplaceUtils";
import { Hold } from "../../data/Hold";
import { SearchReplaceResultsDialog } from "./SearchReplaceResultsDialog";

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        padding: theme.spacing(4, 6),
    },
    subtitle: {
        paddingBottom: theme.spacing(2)
    },
    inputs: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: theme.spacing(1),
        '& > *': {
            flex: '40% 0 0'
        }
    }
}));


interface OperationsReplaceProps {
    hold: Hold;
}

export const OperationsReplace = (props: OperationsReplaceProps) => {
    const classes = useStyles();
    const { hold } = props;

    const [isRegex, setIsRegex] = useState(false);
    const checkIfRegex = useCallback((s: string) => {
        setIsRegex(SearchReplaceUtils.isRegex(s));
        return s;
    }, [setIsRegex])

    const [results, setResults] = useState<SearchReplaceResultRow<any>[]|undefined>(undefined);
    const [search, onSearchChange] = useTextInputState("", checkIfRegex);
    const [replace, onReplaceChange] = useTextInputState("");

    const onPreview = useCallback(() => {
        setResults(SearchReplaceUtils.prepare(
            SearchReplaceUtils.toRegex(search),
            replace, hold
        ));
    }, [setResults, hold, search, replace]);

    return <Paper className={classes.container}>
        <Typography variant="h5" noWrap>
            Search & Replace
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
            You can use this to search and replace text across the whole hold. Search is
            case-sensitive.
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
            You can use regular expressions in <em>Search</em> field by surrounding the text
            with forward slashes. The following flags are supported: <code>i</code> (case-insensitive),
            <code>m</code> (multiline mode), <code>s</code> (dotall mode) and <code>u</code> (full unicode support).
            Trying to use other characters in the flags section or using the same flag multiple times
            will cause the whole string to be treated as a normal string rather than a regular expression.
        </Typography>
        <div style={{ flex: 1 }} />
        <Box className={classes.inputs}>
            <TextField variant="outlined" label={isRegex ? 'Search (Regexp)' : 'Search'} value={search} onChange={onSearchChange} />
            <TextField variant="outlined" label="Replace" value={replace} onChange={onReplaceChange} />
        </Box>
        <Box className={classes.inputs}>
            <Button variant="contained">Preview</Button>
        </Box>
        <SearchReplaceResultsDialog results={results} onClose={() => {}} />
    </Paper>;
}