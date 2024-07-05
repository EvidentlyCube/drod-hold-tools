import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { Hold } from "./Hold";
import { HoldChange, HoldChangeDataName, HoldChangeSpeechMessage, HoldChangeType } from "./HoldChange";
import { HoldData } from "./HoldData";
import { HoldSpeech } from "./HoldSpeech";

export class HoldChangeListener {
	public register(hold: Hold) {
		hold.speeches.forEach(speech => {
			this.registerSpeechMessageChange(speech);
		});
		hold.datas.forEach(data => {
			this.registerDataNameChange(data);
		});
	}

	private registerSpeechMessageChange(speech: HoldSpeech) {
		const { $hold, id, message } = speech;

		const change = $hold.$changes.create<HoldChangeSpeechMessage>({
			type: HoldChangeType.SpeechMessage,
			location: { speechId: id },
			value: message.newValue
		});

		registerTextChange($hold, change, message);
	}

	private registerDataNameChange(data: HoldData) {
		const { $hold, id, name } = data;

		const change = $hold.$changes.create<HoldChangeDataName>({
			type: HoldChangeType.DataName,
			location: { dataId: id },
			value: name.newValue
		});

		registerTextChange($hold, change, name);
	}
}

function registerTextChange(hold: Hold, change: HoldChange, updatableValue: SignalUpdatableValue<any>) {
	updatableValue.onChange.add(newValue => {
		change.value = newValue;

		if (newValue === undefined || newValue === updatableValue.oldValue) {
			hold.$changes.del(change)
		} else {
			hold.$changes.add(change)
		}
	})
}