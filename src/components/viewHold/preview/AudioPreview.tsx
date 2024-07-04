import AudioPlayer from 'react-h5-audio-player';

interface Props {
	name: string;
	dataUri: string;
	onClose: () => void;
}
export default function AudioPreview(props: Props) {
	const { name, dataUri, onClose } = props;

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">{name}</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body is-flex is-justify-content-center is-align-items-center no-footer">
					<AudioPlayer
						style={{width: "400px"}}
						src={dataUri}
						showSkipControls={false}
						customAdditionalControls={[]}/>
				</section>
			</div>
		</div>
	);
}
