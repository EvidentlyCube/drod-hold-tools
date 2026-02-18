import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { escapeRegex } from "../../utils/StringUtils";
import { HoldRef } from "../references/HoldReference";
import { wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface VariableConstructor {
	id: number;
	encName: string;
}
export class HoldVariable {
	public readonly hold: Hold;

	public readonly id: number;
	public readonly name: SignalUpdatableValue<string>;

	public readonly $uses: HoldRef[] = [];

	public isUsedInFormula(formula: string) {
		return this.isUsedInFormulaRegexp.test(formula);
	}

	public isUsedInText(text: string) {
		return this.isUsedInTextRegexp.test(text);
	}

	private get isUsedInFormulaRegexp() {
		return new RegExp(`\\b${escapeRegex(this.name.newValue)}\\b`, 'i');
	}

	private get isUsedInTextRegexp() {
		return new RegExp(`\$${escapeRegex(this.name.newValue)}\$`, 'i');
	}

	public constructor(hold: Hold, opts: VariableConstructor) {
		this.hold = hold;

		this.id = opts.id;
		this.name = new SignalUpdatableValue(wcharBase64ToString(opts.encName));
	}
}
