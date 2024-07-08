import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { Hold } from "./Hold";
import { HoldChange, HoldChangeDataFile, HoldChangeDataName, HoldChangeSpeechMessage, HoldChangeType } from "./HoldChange";
import { HoldData } from "./HoldData";
import { HoldSpeech } from "./HoldSpeech";

export class HoldChangeListener {
	public register(hold: Hold) {
		hold.speeches.forEach(speech => {
			this.registerSpeechMessageChange(speech);
		});
		hold.datas.forEach(data => {
			this.registerDataNameChange(data);
			this.registerDataFileChange(data);
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

	private registerDataFileChange(data: HoldData) {
		const { $hold, id, details } = data;

		const change = $hold.$changes.create<HoldChangeDataFile>({
			type: HoldChangeType.DataFile,
			location: { dataId: id },
			value: details.newValue
		});

		registerTextChange($hold, change, details);
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