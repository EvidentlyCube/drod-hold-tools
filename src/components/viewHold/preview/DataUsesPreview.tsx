import type { HoldData } from "../../../data/datatypes/HoldData";
import Modal from "../../common/Modal";
import { HoldRefsTableList } from "../HoldRefView";

interface Props {
	data: HoldData;
	onClose: () => void;
}
export default function DataUsesPreview(props: Props) {
	const { data, onClose } = props;

	return (
		<Modal title={`Uses of data "${data.name.newValue}"`} onClose={onClose}>
			<HoldRefsTableList holdRefs={data.$uses} />
		</Modal>
	);
}
