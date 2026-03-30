import type { HoldVariable } from "../../../data/datatypes/HoldVariable";
import Modal from "../../common/Modal";
import { HoldRefsTableList } from "../HoldRefView";

interface Props {
	variable: HoldVariable;
	onClose: () => void;
}
export default function VariableUsesPreview(props: Props) {
	const { variable, onClose } = props;

	return (
		<Modal
			title={`Uses of variable "${variable.name.newValue}"`}
			onClose={onClose}
		>
			<HoldRefsTableList holdRefs={variable.$uses} />
		</Modal>
	);
}
