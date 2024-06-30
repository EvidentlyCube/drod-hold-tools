import { ScriptCommandType } from "../DrodEnums";

export interface ScriptCommand {
	type: ScriptCommandType;
	index: number;
	x: number;
	y: number;
	w: number;
	h: number;
	flags: number;
	speechId: number;
	label: string;
}