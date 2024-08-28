import { getCommandDataId } from "./CommandUtils";
import { Hold } from "./datatypes/Hold";
import { ScriptCommand } from "./datatypes/ScriptCommand";


export class CommandsList {
	public readonly hold: Hold;
	public readonly commands: ReadonlyArray<ScriptCommand>;

	private _commandsWithSpeech?: ReadonlyArray<ScriptCommand>;
	private _commandsWithData?: ReadonlyArray<ScriptCommand>;

	public constructor(hold: Hold, commandList: ScriptCommand[]) {
		this.hold = hold;
		this.commands = commandList;
	}

	public get $commandsWithSpeech() {
		if (!this._commandsWithSpeech) {
			this._commandsWithSpeech = this.commands.filter(command => command.speechId);
		}

		return this._commandsWithSpeech;
	}

	public get $commandsWithData() {
		if (!this._commandsWithData) {
			this._commandsWithData = this.commands.filter(command => getCommandDataId(command));
		}

		return this._commandsWithData;
	}
}