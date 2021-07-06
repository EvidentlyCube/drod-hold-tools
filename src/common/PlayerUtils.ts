import {Player} from "../data/Player";

export const PlayerUtils = {
	getName(player: Player) {
		const name = player.changes.name ?? player.name;

		return `${name} (#${player.id})`;
	},
};