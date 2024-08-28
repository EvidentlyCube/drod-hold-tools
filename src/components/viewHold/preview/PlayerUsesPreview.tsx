import { HoldPlayer } from "../../../data/datatypes/HoldPlayer";
import HoldRefView from "../HoldRefView";

interface Props {
	player: HoldPlayer;
	onClose: () => void;
}
export default function PlayerUsesPreview(props: Props) {
	const { player, onClose } = props;

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Uses of Player "{player.name.newValue}"</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<table>
						<tbody>
							{player.$uses.map((ref, index) => (
								<tr key={index}>
									<td>
										<HoldRefView holdRef={ref} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			</div>
		</div>
	);
}
