import {Data, DataFormat} from "../../data/Data";
import {AppBar, Dialog, Toolbar} from "@material-ui/core";
import {BorderStyle, Close, FormatColorFill, ZoomIn, ZoomOut} from "@material-ui/icons";
import {Box, IconButton, Typography} from "@material-ui/core/";
import {DataUtils} from "../../common/DataUtils";
import React, {useCallback, useState} from "react";

const TopBar = ({name, onClose, children}: { name: string, onClose: () => void, children?: React.ReactNode }) => {
	return <AppBar>
		<Toolbar>
			<IconButton edge="start" color="inherit" onClick={onClose}>
				<Close/>
			</IconButton>

			<Typography variant="h6" component="div" flexGrow={1}>{name}</Typography>
			{children}
		</Toolbar>
	</AppBar>;
};

const DialogBody = ({children, style}: { children: React.ReactNode, style: React.CSSProperties }) => {
	const totalStyle = {
		...style,
		display: 'flex',
		flex: '1',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: '64px'
	}
	return <Box style={totalStyle}>
		{children}
	</Box>;
};

const Backgrounds = [
	'#000000',
	'#C0C0C0',
	'#FFFFFF'
];

interface PreviewActualProps {
	name: string;
	data: Data;
	onClose: () => void;
}

const PreviewImage = ({name, data, onClose}: PreviewActualProps) => {
	const [zoom, setZoom] = useState(1);
	const [border, setBorder] = useState(false);
	const [background, setBackground] = useState(2);
	const zoomIn = useCallback(() => {
		setZoom(zoom * 2);
	}, [zoom, setZoom]);
	const zoomOut = useCallback(() => {
		setZoom(Math.max(0.125, zoom / 2));
	}, [zoom, setZoom]);
	const toggleBorder = useCallback(() => {
		setBorder(!border);
	}, [border, setBorder]);
	const toggleBackgorund = useCallback(() => {
		setBackground((background + 1) % Backgrounds.length);
	}, [background, setBackground]);

	const borderColor = background === 0 ? 'white' : 'black';

	return <>
		<TopBar name={name} onClose={onClose}>
			<IconButton onClick={zoomOut} disabled={zoom <= 0.125} color="inherit">
				<ZoomOut/>
			</IconButton>
			<Typography variant="body2">
				{zoom * 100}%
			</Typography>
			<IconButton onClick={zoomIn} disabled={zoom >= 32} color="inherit">
				<ZoomIn/>
			</IconButton>
			<IconButton onClick={toggleBorder} color="inherit">
				<BorderStyle/>
			</IconButton>
			<IconButton onClick={toggleBackgorund} color="inherit">
				<FormatColorFill/>
			</IconButton>
		</TopBar>
		<DialogBody style={{background: Backgrounds[background]}}>
			<img
				alt={`${data.name} preview`}
				className="crisp"
				style={{
					transform: `scale(${zoom})`,
					border: border ? `2px dashed ${borderColor}` : 'none',
				}}
				src={DataUtils.getImageUrl(data)}/>
		</DialogBody>
	</>;
};

const PreviewAudio = ({name, data, onClose}: PreviewActualProps) => {
	return <>
		<TopBar name={name} onClose={onClose} />
		<DialogBody style={{}}>
			<audio src={DataUtils.getAudioUrl(data)} controls/>
		</DialogBody>
	</>;
};

interface DataPreviewDialogProps {
	name: string;
	data?: Data;
	onClose: () => void;
}

const DialogContents = ({name, data, onClose}: DataPreviewDialogProps) => {
	if (!data) {
		return <></>
	} else if (data.format === DataFormat.BMP || data.format === DataFormat.JPG || data.format === DataFormat.PNG) {
		return <PreviewImage name={name} data={data} onClose={onClose}/>;
	} else if (data.format === DataFormat.WAV || data.format === DataFormat.OGG) {
		return <PreviewAudio name={name} data={data} onClose={onClose}/>;
	}

	return <>
		<TopBar name={name} onClose={onClose}/>
		<DialogBody style={{}}>
			Unknown format '{data.format}'
		</DialogBody>
	</>
};
export const DataPreviewDialog = (props: DataPreviewDialogProps) => {
	const {data, onClose} = props;
	return <Dialog open={!!data} onClose={onClose} fullScreen>
		<DialogContents {...props}/>
	</Dialog>;
};