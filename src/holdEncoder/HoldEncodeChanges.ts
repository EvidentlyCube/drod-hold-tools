import {Hold} from "../data/Hold";
import {Speech} from "../data/Speech";
import {Room} from "../data/Room";
import {Monster} from "../data/Monster";
import {StringUtils} from "../common/StringUtils";


export const HoldEncodeChanges = {
	hold(hold: Hold) {
		hold.dateUpdated = new Date();
		hold.xml.setAttribute('LastUpdated', Math.floor(hold.dateUpdated.getTime() / 1000).toString());
	},
	room(room: Room, hold: Hold) {
		for (const monster of room.monsters) {
			HoldEncodeChanges.monster(monster, room, hold);
		}
	},
	monster(monster: Monster, room: Room, hold: Hold) {
		// Do nothing yet
	},
	speech(speech: Speech, hold: Hold) {
		if (speech.isDeleted) {
			speech.xml.remove();
		} else if (speech.changes.text) {
			speech.text = speech.changes.text;
			delete (speech.changes.text);

			speech.xml.setAttribute('Message', btoa(StringUtils.stringToWString(speech.text)));
		}
	},
};
