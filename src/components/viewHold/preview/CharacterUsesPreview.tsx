import type { HoldCharacter } from "../../../data/datatypes/HoldCharacter";
import FullModal from "../../common/FullModal";
import HoldRefView from "../HoldRefView";

interface Props {
	character: HoldCharacter;
	onClose: () => void;
}
export default function CharacterUsesPreview(props: Props) {
	const { character, onClose } = props;

	return (
		<FullModal title={`Uses of ${character.name.newValue}`} onClose={onClose}>
			<table>
				<tbody>
					{character.$uses.map((ref, index) => (
						// biome-ignore lint: It doesn't change
						<tr key={index}>
							<td>
								<HoldRefView holdRef={ref} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</FullModal>
	);
}
