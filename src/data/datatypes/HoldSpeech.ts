import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { HoldRefCharacterCommand, HoldRefMonsterCommand } from "../references/HoldReference";
import { getCharacterName, getSpeakerMood, wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";
import { HoldData } from "./HoldData";

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
	public readonly dataId: SignalUpdatableValue<number|undefined>;
	public readonly character: number;
	public readonly mood: SignalUpdatableValue<number>;
	public readonly delay: number;
	public readonly message: SignalUpdatableValue<string>;

	public $location?: HoldRefCharacterCommand | HoldRefMonsterCommand;

	public get $speaker(): string {
		return getCharacterName(this.$hold, this.character);
	}

	public get $mood() :string {
		return getSpeakerMood(this.mood.newValue);
	}

	public get $data(): HoldData | undefined {
		return this.dataId.newValue ? this.$hold.datas.get(this.dataId.newValue) : undefined;
	}

	public constructor(hold: Hold, opts: SpeechConstructor) {
		this.$hold = hold;

		this.id = opts.id
		this.dataId = new SignalUpdatableValue(opts.dataId)
		this.character = opts.character
		this.mood = new SignalUpdatableValue(opts.mood);
		this.delay = opts.delay
		this.message = new SignalUpdatableValue(wcharBase64ToString(opts.encMessage));
	}
}