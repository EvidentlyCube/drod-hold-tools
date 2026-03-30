import type { HoldPlayer } from "../../../data/datatypes/HoldPlayer";
import Modal from "../../common/Modal";
import { HoldRefsTableList } from "../HoldRefView";

interface Props {
	player: HoldPlayer;
	onClose: () => void;
}
export default function PlayerUsesPreview(props: Props) {
	const { player, onClose } = props;

	return (
		<Modal title={`Uses of Player "${player.name.newValue}"`} onClose={onClose}>
			<HoldRefsTableList holdRefs={player.$uses} />
		</Modal>
	);
}
