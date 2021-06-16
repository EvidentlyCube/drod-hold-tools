import {useDropzone} from "react-dropzone";
import {Button} from "@material-ui/core/";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles(() => ({
	button: {
		width: '100%',
	},
}));

interface DropzoneProps {
	onDrop: (files: File[]) => void;
}

export const DropzoneCsv = (props: DropzoneProps) => {
	const {onDrop} = props;
	const {getRootProps, getInputProps} = useDropzone({onDrop});
	const classes = useStyles();

	return <div {...getRootProps()}>
		<input {...getInputProps()} />
		<Button variant="contained" color="secondary" className={classes.button}>Import CSV (or drop file)</Button>
	</div>;
};