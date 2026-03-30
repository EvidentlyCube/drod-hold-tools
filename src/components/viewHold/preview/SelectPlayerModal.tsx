import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import type { Hold } from "../../../data/datatypes/Hold";
import { filterString, sortCompareString } from "../../../utils/SortUtils";
import Modal from "../../common/Modal";

interface Props {
	hold: Hold;
	onClose: () => void;
	onSelect: (playerId: number) => void;
}
export default function SelectPlayerModal(props: Props) {
	const { hold, onClose, onSelect } = props;

	const [filter, setFilter] = useState("");
	const basePlayers = useMemo(() => {
		const players = hold.players.filterToArray(
			player => player.$isDeleted.newValue === false,
		);
		players.sort((l, r) =>
			sortCompareString(true, l.name.newValue, r.name.newValue),
		);

		return players;
	}, [hold.players]);

	const filteredPlayers = basePlayers.filter(player =>
		filterString(player.name.newValue, filter),
	);

	const updateFilter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setFilter(e.target.value);
	}, []);

	return (
		<Modal title="Replace player" onClose={onClose}>
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
					{filteredPlayers.map(player => (
						<tr key={player.id}>
							<td>{player.name.newValue}</td>
							<td>
								<button
									type="button"
									className="button"
									onClick={() => onSelect(player.id)}
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
