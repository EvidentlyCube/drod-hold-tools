import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import type { DataFormat } from "../../../data/DrodEnums";
import type { Hold } from "../../../data/datatypes/Hold";
import { filterString, sortCompareString } from "../../../utils/SortUtils";
import Modal from "../../common/Modal";
import DataRefView from "../DataRefView";

interface Props {
	hold: Hold;
	formats: DataFormat[];
	allowEmpty: boolean;
	onClose: () => void;
	onSelect: (dataId: number | undefined) => void;
}
export default function SelectDataModal(props: Props) {
	const { hold, formats, onClose, onSelect, allowEmpty } = props;

	const [filter, setFilter] = useState("");
	const baseDatas = useMemo(() => {
		const datas = hold.datas
			.filterToArray(data => formats.includes(data.details.newValue.format))
			.filter(data => data.$isDeleted.newValue === false);

		datas.sort((l, r) =>
			sortCompareString(true, l.name.newValue, r.name.newValue),
		);

		return datas;
	}, [hold, formats]);

	const filteredDatas = baseDatas.filter(data =>
		filterString(data.name.newValue, filter),
	);

	const updateFilter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setFilter(e.target.value);
	}, []);

	return (
		<Modal title="Replace data" onClose={onClose}>
			<table className="table is-fullwidth is-hoverable is-striped is-middle">
				<thead>
					<tr>
						<th colSpan={3}>
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
					{allowEmpty && (
						<tr>
							<td>
								<span className="is-muted">n/a</span>
							</td>
							<td>
								<span className="is-muted">No Data</span>
							</td>
							<td>
								<button
									type="button"
									className="button"
									onClick={() => onSelect(undefined)}
								>
									Select
								</button>
							</td>
						</tr>
					)}
					{filteredDatas.map(data => (
						<tr key={data.id}>
							<td>
								<DataRefView data={data} />
							</td>
							<td>{data.name.newValue}</td>
							<td>
								<button
									type="button"
									className="button"
									onClick={() => onSelect(data.id)}
								>
									Select
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</Modal>
	);
}
