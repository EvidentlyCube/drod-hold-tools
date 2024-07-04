import { areObjectsSame } from "../../utils/ObjectUtils";
import { SignalSet } from "../../utils/SignalSet";
import { Signal } from "../../utils/Signals";

export enum HoldChangeType {
	SpeechMessage = 0,
	DataName = 1,
}

export interface HoldChangeSpeechMessage {
	type: HoldChangeType.SpeechMessage;
	location: { speechId: number };

	value?: string;
}

export type HoldChangeDataName = {
	type: HoldChangeType.DataName,
	location: { dataId: number };

	value?: string;
}

export type HoldChange = HoldChangeSpeechMessage
	| HoldChangeDataName;

function match(left: HoldChange, right: HoldChange) {
	return left.type === right.type && areObjectsSame(left.location, right.location);
}

export class HoldChangeList {
	public readonly list = new SignalSet<HoldChange>();
	public readonly onChange = new Signal<HoldChange>();

	public loadStored(changes: HoldChange[]) {
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