import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import type {
	HoldRefCharacterCommand,
	HoldRefEntrance,
	HoldRefHoldEndMessage,
	HoldRefMonsterCommand,
	HoldRefScroll,
	HoldRefSpeech,
} from "../references/HoldReference";
import { wcharBase64ToString } from "../Utils";
import {
	getVariableInFormulaRegexp,
	isVariableUsedInText,
} from "../VariableUtils";
import type { Hold } from "./Hold";

type HoldVariableUseRef =
	| HoldRefCharacterCommand
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

	private _formulaRegexpCache?: RegExp;

	public isUsedInFormula(formula: string) {
		this._formulaRegexpCache ||= getVariableInFormulaRegexp(this.name.newValue);

		return (
			formula.toLowerCase().includes(this.name.newValue.toLowerCase())
			&& this._formulaRegexpCache.test(formula)
		);
	}

	public isUsedInText(text: string) {
		this._formulaRegexpCache ||= getVariableInFormulaRegexp(this.name.newValue);

		return (
			text.toLowerCase().includes(this.name.newValue.toLowerCase())
			&& isVariableUsedInText(text, this._formulaRegexpCache)
		);
	}

	public constructor(hold: Hold, opts: VariableConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));

		// Clear cache when name changes
		this.name.onChange.add(() => {
			this._formulaRegexpCache = undefined;
		});
	}
}
