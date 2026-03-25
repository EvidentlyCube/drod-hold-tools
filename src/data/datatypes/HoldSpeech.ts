import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { doesCommandUseSpeech } from "../CommandUtils";
import { HoldRefCharacterCommand, HoldRefModel, HoldRefMonsterCommand, HoldRefSpeech, resolveReference } from "../references/HoldReference";
import { TextUtils } from "../TextUtils";
import { getSpeakerName, wcharBase64ToString } from "../Utils";
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

	public readonly $isDeleted: SignalUpdatableValue<boolean>;
	public $location?: HoldRefCharacterCommand | HoldRefMonsterCommand;

	public get $speaker(): string {
		const command = resolveReference(this.$location);
		return getSpeakerName(this.$hold, this.character, command?.x ?? 0, command?.y ?? 0);
	}

	public get $mood() :string {
		return TextUtils.moodName(this.mood.newValue);
	}

	public get $data(): HoldData | undefined {
		return this.dataId.newValue ? this.$hold.datas.get(this.dataId.newValue) : undefined;
	}

	public get $ref(): HoldRefSpeech {
		return {
			model: HoldRefModel.Speech,
			hold: this.$hold,
			speechId: this.id
		};
	}

	/**
	 * Check if this speech can be deleted - this is only allowed if it's used
	 * by a command that does not use speech.
	 */
	public get $canDelete(): boolean {
		if (!this.$location) {
			return true;
		}

		return !doesCommandUseSpeech(resolveReference(this.$location).type);
	}

	public constructor(hold: Hold, opts: SpeechConstructor) {
		this.$hold = hold;

		this.id = opts.id
		this.dataId = new SignalUpdatableValue(opts.dataId)
		this.character = opts.character
		this.mood = new SignalUpdatableValue(opts.mood);
		this.delay = opts.delay
		this.message = new SignalUpdatableValue(wcharBase64ToString(opts.encMessage));

		this.$isDeleted = new SignalUpdatableValue(false);
	}
}