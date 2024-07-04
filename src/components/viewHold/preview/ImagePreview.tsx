import { useCallback } from "react";
import { useImageSize } from "react-image-size";
import useLocalStorageState from "use-local-storage-state";
import { useKeyDownCallback } from "../../../hooks/useKeyboardCallback";

const Backgrounds = [
	'has-background-white',
	'has-background-drod-transparent-gray',
	'has-background-black',
	'has-background-chessboard',
];

const ZoomLevels = [
	0.25,
	0.5,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	8,
	16,
	32,
	64,
	128,
	256,
	512
];

interface Props {
	name: string;
	dataUri: string;
	onClose: () => void;
}
export default function ImagePreview(props: Props) {
	const { name, dataUri, onClose } = props;

	const [dimensions, { loading }] = useImageSize(dataUri);
	const [background, setBackground] = useLocalStorageState('modal::preview-bg', { defaultValue: 0})
	const [zoomLevel, setZoomLevel] = useLocalStorageState('modal::zoom', { defaultValue: 1})
	useKeyDownCallback({
		Escape: () => onClose()
	});

	const toggleBackground = useCallback(() => {
		setBackground(background + 1);
	}, [background, setBackground]);

	const increaseZoomLevel = useCallback(() => {
		if (zoomLevel < ZoomLevels.length - 1) {
			setZoomLevel(zoomLevel + 1);
		}
	}, [zoomLevel, setZoomLevel]);

	const decreaseZoomLevel = useCallback(() => {
		if (zoomLevel > 0) {
			setZoomLevel(zoomLevel - 1);
		}
	}, [zoomLevel, setZoomLevel]);

	const backgroundClass = Backgrounds[background % Backgrounds.length];
	const style = !dimensions
		? {}
		: {
		width: `${dimensions.width * ZoomLevels[zoomLevel]}px`,
		height: `${dimensions.height * ZoomLevels[zoomLevel]}px`,
	};

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">{name}</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className={`modal-card-body is-flex is-justify-content-center is-align-items-center ${backgroundClass}`}>
					{!loading && <img src={dataUri} alt={name} style={style} />}
				</section>
				<footer className="modal-card-foot is-justify-content-center">
					<div className="buttons">
						<button className="icon is-large" onClick={decreaseZoomLevel} disabled={zoomLevel === 0}>
							<i className="fas fa-magnifying-glass-minus"/>
						</button>
						<button className="icon is-large" onClick={increaseZoomLevel} disabled={zoomLevel === ZoomLevels.length - 1}>
							<i className="fas fa-magnifying-glass-plus"/>
						</button>
						<button className="icon is-large" onClick={toggleBackground}>
							<i className="fas fa-palette"/>
						</button>
					</div>
				</footer>
			</div>
		</div>
	);
}
