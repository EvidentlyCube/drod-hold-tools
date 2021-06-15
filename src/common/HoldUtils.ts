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
		assert(speech, `Speech with ID '${speechId}' does not exist`);

		return speech;
	}, 
	
	getEntrance(entranceID: number, hold: Hold) {
		const speech = hold.entrances.get(entranceID);
		assert(speech, `Entrance with ID '${entranceID}' does not exist`);

		return speech;
	}, 
	
	getScroll(scrollId: string, hold: Hold) {
		const scroll = hold.scrolls.get(scrollId);
		assert(scroll, `Scroll with ID '${scrollId}' does not exist`);

		return scroll;
	}, 
	
	getCharacter(characterId: number, hold: Hold) {
		const speech = hold.characters.get(characterId);
		assert(speech, `Character with ID '${characterId}' does not exist`);

		return speech;
	}, 
	
	getLevel(levelId: number, hold: Hold) {
		const speech = hold.levels.get(levelId);
		assert(speech, `Speech with ID '${levelId}' does not exist`);

		return speech;
	}, 

	getPlayer(playerId: number, hold: Hold) {
		const player = hold.players.get(playerId);
		assert(player, `Player with ID '${playerId}' does not exist`);

		return player;
	}, 
};