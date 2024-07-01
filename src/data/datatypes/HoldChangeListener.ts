import { Hold } from "./Hold";
import { HoldChangeSpeechMessage, HoldChangeType } from "./HoldChange";
import { HoldSpeech } from "./HoldSpeech";

export class HoldChangeListener {
	public register(hold: Hold) {
		hold.speeches.forEach(speech => {
			this.registerSpeechMessageChange(speech);
		});
	}

	private registerSpeechMessageChange(speech: HoldSpeech) {
		const { $hold: hold, id, message } = speech;

		const change = hold.$changes.create({
			type: HoldChangeType.SpeechMessage,
			id,
			index: 0,
			value: message.newText
		} as HoldChangeSpeechMessage);

		message.onNewTextChange.add(newText => {
			change.value = newText;

			if (newText === undefined || newText === message.oldText) {
				hold.$changes.del(change)
			} else {
				hold.$changes.add(change)
			}
		})
	}
}