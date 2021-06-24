import {Data, DataFormat} from "../../data/Data";
import {AppBar, Button, Dialog, Toolbar} from "@material-ui/core";
import {Backup, BorderStyle, ChangeHistory, Close, FormatColorFill, History, ZoomIn, ZoomOut} from "@material-ui/icons";
import {Box, IconButton, Typography} from "@material-ui/core/";
import {DataUtils} from "../../common/DataUtils";
import React, {useCallback, useEffect, useState} from "react";
import { LightTooltip } from "../../common/components/LightTooltip";
import { Hold } from "../../data/Hold";
import { DataUploader } from "../../common/operations/DataUploader";
import { UpdateUtils } from "../../common/UpdateUtils";

interface TopBarProps {
	data: Data;
	hold: Hold;
	onClose: () => void;
	children?: React.ReactNode;
	showOld?: boolean;
	setShowOld?: (value: boolean) => void;
	setDataUrl?: (value: string) => void;
}


const TopBar = ({data, hold, onClose, children, showOld, setShowOld, setDataUrl}: TopBarProps) => {
	const onToggle = useCallback(() => {
		setShowOld?.(!showOld);
		setDataUrl?.(DataUtils.getImageUrl(data, !showOld));
	}, [setShowOld, showOld]);

	const onUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const result = await DataUploader.uploadFile(
				e.target.files[0]!,
				data, hold, /\.(png|jpe?g|bmp)$/i
			);

			setShowOld?.(false);
			setDataUrl?.(DataUtils.getImageUrl(data, false));
		}
	}, [setShowOld, hold, setDataUrl, data]); 

	const onUndo = useCallback(() => {
		UpdateUtils.dataData(data, data.data, hold);
		setShowOld?.(false);
		setDataUrl?.(DataUtils.getImageUrl(data, true));
	}, [data, hold, setShowOld, setDataUrl]);

	return <AppBar>
		<Toolbar>
			<IconButton edge="start" color="inherit" onClick={onClose}>
				<Close/>
			</IconButton>
			<Typography variant="h6" component="div" flexGrow={1}>
				{data.name} {data.changes.data !== undefined ? (showOld ? '(old)' : '(new)') : ''}
			</Typography>

			{data.changes.data !== undefined && 
			<LightTooltip title="Click to reset changes">
				<Button color="inherit" onClick={onUndo}>Undo</Button>
			</LightTooltip>}
			<LightTooltip title="Click to upload a new version">
				<Button color="inherit" component="label">
					Replace
					<input type="file" onChange={onUpload} hidden/>
				</Button>
			</LightTooltip>

			{data.changes.data !== undefined && 
			<LightTooltip title="Click to toggle the display between the new and the old version">
				<Button color="inherit" onClick={onToggle}>Toggle</Button>
			</LightTooltip>}

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
	hold: Hold;
	data: Data;
	onClose: () => void;
}

const PreviewImage = ({hold, data, onClose}: PreviewActualProps) => {
	const [showOld, setShowOld] = useState(false);
	const [dataUrl, setDataUrl] = useState('');
	useEffect(() => {
		setDataUrl(DataUtils.getImageUrl(data, false));
	}, [setDataUrl, data]);

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
		<TopBar hold={hold} data={data} showOld={showOld} onClose={onClose} setShowOld={setShowOld} setDataUrl={setDataUrl}>
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
				src={dataUrl}/>
		</DialogBody>
	</>;
};

const PreviewAudio = ({hold, data, onClose}: PreviewActualProps) => {
	return <>
		<TopBar hold={hold} data={data} onClose={onClose} />
		<DialogBody style={{}}>
			<audio src={DataUtils.getAudioUrl(data, true)} controls/>
		</DialogBody>
	</>;
};

interface DataPreviewDialogProps {
	data?: Data;
	hold: Hold;
	onClose: () => void;
}

const DialogContents = ({hold, data, onClose}: DataPreviewDialogProps) => {
	if (!data) {
		return <></>
	} else if (data.format === DataFormat.BMP || data.format === DataFormat.JPG || data.format === DataFormat.PNG) {
		return <PreviewImage hold={hold} data={data} onClose={onClose}/>;
	} else if (data.format === DataFormat.WAV || data.format === DataFormat.OGG) {
		return <PreviewAudio hold={hold} data={data} onClose={onClose}/>;
	}

	return <>
		<TopBar hold={hold} data={data} onClose={onClose}/>
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