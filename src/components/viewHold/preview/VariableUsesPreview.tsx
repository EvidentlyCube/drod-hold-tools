import { HoldVariable } from "../../../data/datatypes/HoldVariable";
import HoldRefView from "../HoldRefView";

interface Props {
	variable: HoldVariable;
	onClose: () => void;
}
export default function VariableUsesPreview(props: Props) {
	const { variable, onClose } = props;

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Uses of variable {variable.name.newValue}</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<table>
						<tbody>
							{variable.$uses.map((ref, index) => (
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
