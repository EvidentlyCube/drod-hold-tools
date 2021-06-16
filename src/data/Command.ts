import {CharCommand} from "../common/Enums";

export interface Command {
	command: CharCommand;
	x: number;
	y: number;
	w: number;
	h: number;
	flags: number;
	speechId: number;
	label: string;

	changes: Partial<Omit<Command, 'changes'>>;
}

export function createNullCommand(): Command {
	return {
		command: CharCommand._CC_Missing,
		x: 0,
		y: 0,
		w: 0,
		h: 0,
		flags: 0,
		speechId: 0,
		label: '',
		changes: {}
	};
}