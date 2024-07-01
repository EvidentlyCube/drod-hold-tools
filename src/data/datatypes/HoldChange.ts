import { SignalSet } from "../../utils/SignalSet";
import { Signal } from "../../utils/Signals";

export enum HoldChangeType {
	SpeechMessage = 0,
}

export type HoldChangeSpeechMessage = {
	type: HoldChangeType.SpeechMessage,
	id: number;
	index: 0;

	value?: string;
}

export type HoldChange = HoldChangeSpeechMessage;

function match(left: HoldChange, right: HoldChange) {
	return left.type === right.type && left.id === right.id && left.index === right.index;
}

export class HoldChangeList {
	public readonly list = new SignalSet<HoldChange>();
	public readonly onChange = new Signal<HoldChange>();

	public loadStored(changes: HoldChange[]) {
		console.log("Loaded changes");
		console.log(changes);

		changes.forEach(change => this.list.add(change));
	}

	public add(change: HoldChange) {
		this.list.add(change);
		this.onChange.dispatch(change);
	}

	public del(change: HoldChange) {
		this.list.delete(change);
		this.onChange.dispatch(change);
	}

	public create<T extends HoldChange>(change: T): T {
		return (this.list.find(stored => match(stored, change)) ?? change) as T;
	}

}