import { Hold } from "./datatypes/Hold";
import { HoldChangeType } from "./datatypes/HoldChange";

export function applyHoldChanges(hold: Hold) {
	for (const change of hold.$changes.list.values()) {
		switch (change.type) {
			case HoldChangeType.SpeechMessage:
				hold.speeches.get(change.id)!.message.newText = change.value;
				break;
		}
	}
}