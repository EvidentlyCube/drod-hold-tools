import { Hold } from "./datatypes/Hold";
import { HoldSpeech } from "./datatypes/HoldSpeech";
import { ScriptCommand } from "./datatypes/ScriptCommand";

interface BaseHoldReference {
	model: string;
	id: number;
}
interface HoldReferenceToSpeech extends BaseHoldReference {
	model: 'speech',
	id: number;
};
interface HoldReferenceToCharacterCommand extends BaseHoldReference {
	model: 'charCommand',
	id: number;
	commandIndex: number;
};

export type HoldReference = HoldReferenceToSpeech
	| HoldReferenceToCharacterCommand;

export function resolveReference(hold: Hold, ref: HoldReferenceToSpeech): HoldSpeech;
export function resolveReference(hold: Hold, ref: HoldReferenceToCharacterCommand): ScriptCommand;
export function resolveReference(hold: Hold, ref: HoldReference): unknown {
	switch (ref.model) {
		case 'speech':
			return hold.speeches.get(ref.id)!;

		case 'charCommand':
			return hold.characters.get(ref.id)!.$commandList!.commands[ref.commandIndex];
	}
}