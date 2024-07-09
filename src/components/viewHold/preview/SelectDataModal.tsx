import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { DataFormat } from "../../../data/DrodEnums";
import { Hold } from "../../../data/datatypes/Hold";
import { HoldData } from "../../../data/datatypes/HoldData";
import HoldRefView from "../HoldRefVIew";
import { filterString, sortCompareString } from "../../../utils/SortUtils";
import DataRefView from "../DataRefView";

interface Props {
	hold: Hold;
	formats: DataFormat[];
	onClose: () => void;
	onSelect: (data: HoldData) => void;
}
export default function SelectDataModal(props: Props) {
	const { hold, formats, onClose, onSelect } = props;

	const [filter, setFilter] = useState("");
	const baseDatas = useMemo(() => {
		const datas = hold.datas.filterToArray(data => formats.includes(data.details.finalValue.format));
		datas.sort((l, r) => sortCompareString(true, l.name.finalValue, r.name.finalValue));

		return datas;

	}, [hold, formats]);

	const filteredDatas = baseDatas.filter(data => filterString(data.name.finalValue, filter));

	const updateFilter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setFilter(e.target.value);
	}, [setFilter])

	return (
		<div className="modal is-active">
			<div className="modal-background" onClick={onClose}></div>
			<div className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title">Replace data</p>
					<button className="delete" onClick={onClose}></button>
				</header>
				<section className="modal-card-body">
					<table>
						<thead>
							<tr>
								<th colSpan={2}>
								<div className="control has-icons-left">
									<input
										className="input is-small is-rounded"
										defaultValue={filter}
										placeholder="Filter..."
										onInput={updateFilter}
									/>
									<span className="icon is-small is-left">
										<i className="fas fa-magnifying-glass"></i>
									</span>
								</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredDatas.map(data => (
								<tr key={data.id}>
									<td>
										<DataRefView data={data} />
										{data.name.finalValue}
									</td>
									<td>
										<button className="button" onClick={() => onSelect(data)}>
											Select
										</button>
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
