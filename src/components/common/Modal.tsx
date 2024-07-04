import { ReactNode, useCallback } from "react"
import useLocalStorageState from "use-local-storage-state";

const Backgrounds = [
	'has-background-white',
	'has-background-grey',
	'has-background-black',
	'',
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
	8
]

interface Props {
	children: ReactNode;
	onClose: () => void;
}
export default function Modal({children, onClose}: Props) {
	const [background, setBackground] = useLocalStorageState('modal::preview-bg', { defaultValue: 0})
	const [zoomLevel, setZoomLevel] = useLocalStorageState('modal::zoom', { defaultValue: 1})

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
	const style = {
		transform: `scale(${ZoomLevels[zoomLevel]})`
	};


	return <div className="modal is-active">
		<div className="modal-background" onClick={onClose}></div>
		<div
			className={`modal-content is-flex is-justify-content-center ${backgroundClass}`}
			style={style}
		>
			{children}
		</div>
		<div className="modal-top">
			<button className="icon is-large" onClick={decreaseZoomLevel}>
				<i className="fas fa-magnifying-glass-minus"/>
			</button>
			<button className="icon is-large" onClick={increaseZoomLevel}>
				<i className="fas fa-magnifying-glass-plus"/>
			</button>
			<button className="icon is-large" onClick={toggleBackground}>
				<i className="fas fa-palette"/>
			</button>
			<button className="icon is-large" onClick={onClose} aria-label="close">
				<i className="fas fa-xmark"/>
			</button>
		</div>
	</div>
}