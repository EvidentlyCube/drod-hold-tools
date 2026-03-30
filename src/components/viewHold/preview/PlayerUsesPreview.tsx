import type { HoldPlayer } from "../../../data/datatypes/HoldPlayer";
import FullModal from "../../common/FullModal";
import { HoldRefsTableList } from "../HoldRefView";

interface Props {
	player: HoldPlayer;
	onClose: () => void;
}
export default function PlayerUsesPreview(props: Props) {
	const { player, onClose } = props;

	return (
		<FullModal
			title={`Uses of Player "${player.name.newValue}"`}
			onClose={onClose}
		>
			<HoldRefsTableList holdRefs={player.$uses} />
		</FullModal>
	);
}
