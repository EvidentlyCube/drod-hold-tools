import {Speech} from "../data/Speech";
import {Mood, MoodNameMap, Speaker, SpeakerNameMap} from "./Enums";
import {MonsterUtils} from "./MonsterUtils";
import {Hold} from "../data/Hold";

export const SpeechUtils = {
	getDisplayLocation(speech: Speech) {
		if (!speech.location) {
			return undefined;
		}

		if (speech.location.source === 'monster') {
			return `${speech.location.characterName} in ${speech.location.location}`;
		} else {
			return `Hold character ${speech.location.characterName}`;
		}
	},
	getDisplaySpeaker(speech: Speech, hold: Hold) {
		const x = speech.location?.x.toString() ?? undefined;
		const y = speech.location?.y.toString() ?? undefined;

		const moodSuffix = speech.moodId === Mood.Normal ? '' : `, ${MoodNameMap.get(speech.moodId) ?? 'unknown mood'}`;
		if (speech.speakerId === Speaker.Custom) {
			const positionBit = x !== undefined && y !== undefined
				? `${x}, ${y}`
				: 'Unknown position';

			return `Custom (${positionBit})${moodSuffix}`;
		}

		return SpeechUtils.getSpeakerName(speech.speakerId, hold);
	},

	getSpeakerName(speakerId: number, hold: Hold) {
		const builtInSpeaker = SpeakerNameMap.get(speakerId);

		return builtInSpeaker || MonsterUtils.getMonsterName(speakerId, hold);
	},

};