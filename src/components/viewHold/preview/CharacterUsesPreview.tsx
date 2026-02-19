import { HoldCharacter } from "../../../data/datatypes/HoldCharacter";
import HoldRefView from "../HoldRefView";

interface Props {
	character: HoldCharacter;
	onClose: () => void;
}
export default function CharacterUsesPreview(props: Props) {
	const { character, onClose } = props;

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Uses of {character.name.newValue}</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<table>
						<tbody>
							{character.$uses.map((ref, index) => (
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
