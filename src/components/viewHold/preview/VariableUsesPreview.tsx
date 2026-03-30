import type { HoldVariable } from "../../../data/datatypes/HoldVariable";
import FullModal from "../../common/FullModal";
import { HoldRefsTableList } from "../HoldRefView";

interface Props {
	variable: HoldVariable;
	onClose: () => void;
}
export default function VariableUsesPreview(props: Props) {
	const { variable, onClose } = props;

	return (
		<FullModal
			title={`Uses of variable "${variable.name.newValue}"`}
			onClose={onClose}
		>
			<HoldRefsTableList holdRefs={variable.$uses} />
		</FullModal>
	);
}
