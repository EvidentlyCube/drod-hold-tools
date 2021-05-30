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

	changes?: Partial<Omit<Command, 'changes'>>;
}