import { getCommandDataId, writeCommandsBuffer } from "./CommandUtils";
import { Hold } from "./datatypes/Hold";
import { ScriptCommand } from "./datatypes/ScriptCommand";
import { ScriptCommandType } from "./DrodEnums";


export class CommandsList {
	public readonly hold: Hold;
	public readonly commands: ReadonlyArray<ScriptCommand>;

	public wasModified: boolean = false;

	private _commandsWithSpeech?: ReadonlyArray<ScriptCommand>;
	private _commandsWithData?: ReadonlyArray<ScriptCommand>;

	public clearCache() {
		this._commandsWithData = undefined;
		this._commandsWithSpeech = undefined;
	}

	public constructor(hold: Hold, commandList: ScriptCommand[]) {
		this.hold = hold;
		this.commands = commandList;
	}

	public getCommandWithLabel(labelId: number): ScriptCommand | undefined {
		for (const command of this.commands) {
			if (command.type === ScriptCommandType.CC_Label && command.x === labelId) {
				return command;
			}
		}

		return undefined;
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

	public toByteArray() {
		return writeCommandsBuffer(this.commands);
	}
}