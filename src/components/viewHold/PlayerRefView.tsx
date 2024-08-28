import { Hold } from "../../data/datatypes/Hold";
import { useSignalUpdatableValue } from "../../hooks/useSignalUpdatableValue";
import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";

interface PropsByIdDynamic {
	hold: Hold;
	playerIdSource: SignalUpdatableValue<number>;
}

export function PlayerRefViewByIdDynamic({ hold, playerIdSource }: PropsByIdDynamic) {
	const playerId = useSignalUpdatableValue(playerIdSource, true);
	const player = hold.players.get(playerId);

	if (!player) {
		return <span className="is-muted">None</span>;
	}

	return <span>{player.name.newValue}</span>;
}