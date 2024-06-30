import { Hold } from "./datatypes/Hold";
import { ScriptCommand } from "./datatypes/ScriptCommand";


export class CommandsList {
	public readonly hold: Hold;
	public readonly commands: ReadonlyArray<ScriptCommand>;

	public constructor(hold: Hold, commandList: ScriptCommand[]) {
		this.hold = hold;
		this.commands = commandList;
	}
}