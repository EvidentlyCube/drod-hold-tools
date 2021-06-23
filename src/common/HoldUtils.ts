import {Hold} from "../data/Hold";
import {Change} from "../data/Change";
import { assert } from "./Assert";

export const HoldUtils = {
	addChange(hold: Hold, change: Change) {
		for (const existingChange of hold.dataChanges) {
			if (existingChange.type === change.type && existingChange.model === change.model) {
				change.changes = {
					...existingChange.changes,
					...change.changes,
				};
				hold.dataChanges.delete(existingChange);
				break;
			}
		}

		for (const field of Object.keys(change.changes)) {
			if (!(change.changes as any)[field]) {
				delete (change.changes as any)[field];
			}
		}

		if (Object.keys(change.changes).length > 0) {
			hold.dataChanges.add(change);
		}
	},
	getNextPlayerId(hold: Hold){
		let maxId = 0;
		for (const player of hold.players.values()) {
			maxId = Math.max(maxId, player.id);
		}

		return maxId+1;
	},
	
	getSpeech(speechId: number, hold: Hold) {
		const speech = hold.speeches.get(speechId);
		assert(speech, `Speech with Id '${speechId}' does not exist`);

		return speech;
	}, 
	
	getEntrance(entranceId: number, hold: Hold) {
		const speech = hold.entrances.get(entranceId);
		assert(speech, `Entrance with Id '${entranceId}' does not exist`);

		return speech;
	},

	getRoom(roomId: number, hold: Hold) {
		const room = hold.rooms.get(roomId);
		assert(room, `Room with Id '${roomId}' does not exist`);

		return room;
	},
	
	getScroll(scrollId: string, hold: Hold) {
		const scroll = hold.scrolls.get(scrollId);
		assert(scroll, `Scroll with Id '${scrollId}' does not exist`);

		return scroll;
	}, 
	
	getCharacter(characterId: number, hold: Hold) {
		const speech = hold.characters.get(characterId);
		assert(speech, `Character with Id '${characterId}' does not exist`);

		return speech;
	}, 
	
	getLevel(levelId: number, hold: Hold) {
		const speech = hold.levels.get(levelId);
		assert(speech, `Speech with Id '${levelId}' does not exist`);

		return speech;
	}, 

	getPlayer(playerId: number, hold: Hold) {
		const player = hold.players.get(playerId);
		assert(player, `Player with Id '${playerId}' does not exist`);

		return player;
	},

	getData(dataId: number, hold: Hold) {
		const data = hold.datas.get(dataId);
		assert(data, `Data with Id '${dataId}' does not exist`);

		return data;
	}
};