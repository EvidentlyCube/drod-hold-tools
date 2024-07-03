import { HoldRefCharacterCommand, HoldRefMonsterCommand } from "../references/HoldReference";
import { getCharacterName, getSpeakerMood } from "../Utils";
import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";

interface SpeechConstructor {
	id: number;
	dataId?: number;
	character: number;
	mood: number;
	delay: number;
	encMessage: string;
}
export class HoldSpeech {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly dataId?: number;
	public readonly character: number;
	public readonly mood: number;
	public readonly delay: number;
	public readonly message: DrodText;

	public $location?: HoldRefCharacterCommand | HoldRefMonsterCommand;

	public get $speaker(): string {
		return getCharacterName(this.$hold, this.character);
	}

	public get $mood() :string {
		return getSpeakerMood(this.mood);
	}

	public constructor(hold: Hold, opts: SpeechConstructor) {
		this.$hold = hold;

		this.id = opts.id
		this.dataId = opts.dataId
		this.character = opts.character
		this.mood = opts.mood
		this.delay = opts.delay
		this.message = new DrodText(opts.encMessage);
	}
}