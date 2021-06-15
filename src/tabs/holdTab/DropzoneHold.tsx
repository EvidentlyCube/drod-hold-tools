import {useDropzone} from "react-dropzone";
import {Theme, Typography} from "@material-ui/core/";
import {makeStyles} from "@material-ui/styles";
import {Backup} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => ({
	container: {
		width: '100%',
		minHeight: '250px',
		border: 'dashed',
		borderWidth: '3px',
		borderColor: 'rgba(0, 0, 0, 0.12)',
		padding: theme.spacing(3, 2),

		position: 'relative',

		'& .icon': {
			position: 'absolute',
			width: '70px',
			height: '70px',
			left: 'calc(50% - 35px)',
			top: 'calc(50% - 35px)',
		},
	}
}));
interface DropzoneProps {
	onDrop: (files: File[]) => void;
}

export const DropzoneHold = (props: DropzoneProps) => {
	const {onDrop} = props;
	const {getRootProps, getInputProps} = useDropzone({onDrop});
	const classes = useStyles();

	return <div {...getRootProps({className: classes.container})}>
		<input {...getInputProps()} />
		<Typography variant="h4" align="center">Drag and drop a hold here or click</Typography>
		<Backup fontSize="large" className="icon" />
	</div>;
};