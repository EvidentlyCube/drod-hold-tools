import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { HoldRefCharacterCommand, HoldRefEntrance, HoldRefHoldEndMessage, HoldRefMonsterCommand, HoldRefScroll, HoldRefSpeech } from "../references/HoldReference";
import { wcharBase64ToString } from "../Utils";
import { getVariableInFormulaRegexp, getVariableInTextRegexp } from "../VariableUtils";
import type { Hold } from "./Hold";

type HoldVariableUseRef = HoldRefCharacterCommand
	| HoldRefEntrance
	| HoldRefHoldEndMessage
	| HoldRefMonsterCommand
	| HoldRefScroll
	| HoldRefSpeech;

interface VariableConstructor {
	id: number;
	encName: string;
}
export class HoldVariable {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly name: SignalUpdatableValue<string>;

	public readonly $uses: HoldVariableUseRef[] = [];

	public isUsedInFormula(formula: string) {
		return getVariableInFormulaRegexp(this.name.newValue).test(formula);
	}

	public isUsedInText(text: string) {
		return getVariableInTextRegexp(this.name.newValue).test(text);
	}

	public constructor(hold: Hold, opts: VariableConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));
	}
}
