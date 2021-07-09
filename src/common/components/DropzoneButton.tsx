import {useDropzone} from "react-dropzone";
import {Button} from "@material-ui/core/";
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles(() => ({
	button: {
		width: '100%',
	},
}));

interface DropzoneProps {
	label: string;
	onDrop: (files: File[]) => void;

	color?: 'inherit'|'primary'|'secondary';
	variant?: 'contained'|'outlined'|'text';
}

export const DropzoneButton = (props: DropzoneProps) => {
	const {label, color, variant, onDrop} = props;
	const {getRootProps, getInputProps} = useDropzone({onDrop});
	const classes = useStyles();

	return <div {...getRootProps()}>
		<input {...getInputProps()} />
		<Button 
			variant={variant ?? 'contained'} 
			color={color ?? 'secondary'} 
			className={classes.button}>{label}</Button>
	</div>;
};