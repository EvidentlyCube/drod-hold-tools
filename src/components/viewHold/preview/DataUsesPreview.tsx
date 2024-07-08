import { HoldData } from "../../../data/datatypes/HoldData";
import HoldRefView from "../HoldRefVIew";

interface Props {
	data: HoldData;
	onClose: () => void;
}
export default function DataUsesPreview(props: Props) {
	const { data, onClose } = props;

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Uses of {data.name.finalValue}</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<table>
						<tbody>
							{data.$uses.map(ref => (
								<tr key={JSON.stringify(ref)}>
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
