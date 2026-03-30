import AudioPlayer from "react-h5-audio-player";
import FullModal from "../../common/FullModal";

interface Props {
	name: string;
	dataUri: string;
	onClose: () => void;
}
export default function AudioPreview(props: Props) {
	const { name, dataUri, onClose } = props;

	return (
		<FullModal
			title={`Preview of ${name}`}
			onClose={onClose}
			bodyClassName="is-flex is-justify-content-center is-align-items-center"
		>
			<AudioPlayer
				style={{ width: "400px" }}
				src={dataUri}
				showSkipControls={false}
				customAdditionalControls={[]}
			/>
		</FullModal>
	);
}
