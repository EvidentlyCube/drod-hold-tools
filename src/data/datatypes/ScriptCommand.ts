import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { ScriptCommandType } from "../DrodEnums";
import { PackedVarType } from "../PackedVars";

export interface ScriptCommand {
	type: ScriptCommandType;
	index: number;
	x: number;
	y: number;
	w: number;
	h: number;
	flags: number;
	speechId: SignalUpdatableValue<number>;
	label: SignalUpdatableValue<string>;

	/**
	 * @version 201 In some JtRH holds SpeechID is stored not as DWord but as UINT
	 */
	__speechIdType?: PackedVarType;
}