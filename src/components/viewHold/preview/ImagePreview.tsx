import { type CSSProperties, useCallback } from "react";
import { useImageSize } from "react-image-size";
import useLocalStorageState from "use-local-storage-state";
import { useKeyDownCallback } from "../../../hooks/useKeyboardCallback";
import Modal from "../../common/Modal";

const Backgrounds = [
	"has-background-white",
	"has-background-drod-transparent-gray",
	"has-background-black",
	"has-background-chessboard",
];

const ZoomLevels = [
	0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 8, 16, 32, 64, 128, 256, 512,
];

interface Props {
	name: string;
	dataUri: string;
	onClose: () => void;
}
export default function ImagePreview(props: Props) {
	const { name, dataUri, onClose } = props;

	const [dimensions, { loading }] = useImageSize(dataUri);
	const [background, setBackground] = useLocalStorageState(
		"modal::preview-bg",
		{ defaultValue: 0 },
	);
	const [zoomLevel, setZoomLevel] = useLocalStorageState("modal::zoom", {
		defaultValue: 1,
	});
	useKeyDownCallback({
		Escape: () => onClose(),
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
	const style: CSSProperties = {
		maxWidth: "none",
	};
	if (dimensions) {
		style.width = `${dimensions.width * ZoomLevels[zoomLevel]}px`;
		style.height = `${dimensions.height * ZoomLevels[zoomLevel]}px`;
	}

	return (
		<Modal
			onClose={onClose}
			title={`Preview ${name}`}
			modalBodyClassName="p-0"
			contentClassName={`is-flex is-justify-content-center is-align-items-center p-3 ${backgroundClass}`}
			buttons={[
				<button
					key="zoom-in"
					type="button"
					className="button"
					onClick={decreaseZoomLevel}
					disabled={zoomLevel === 0}
				>
					<span className="icon is-large">
						<i className="fas fa-magnifying-glass-minus" />
					</span>
				</button>,
				<button
					key="zoom-out"
					type="button"
					className="button"
					onClick={increaseZoomLevel}
					disabled={zoomLevel === ZoomLevels.length - 1}
				>
					<span className="icon is-large">
						<i className="fas fa-magnifying-glass-plus" />
					</span>
				</button>,
				<button
					key="palette"
					type="button"
					className="button"
					onClick={toggleBackground}
				>
					<span className="icon is-large">
						<i className="fas fa-palette" />
					</span>
				</button>,
			]}
		>
			{!loading && <img src={dataUri} alt={name} style={style} />}
		</Modal>
	);
}
