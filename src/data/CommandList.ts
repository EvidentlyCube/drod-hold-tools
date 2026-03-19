import { getCommandDataId, writeCommandsBuffer } from "./CommandUtils";
import { Hold } from "./datatypes/Hold";
import { ScriptCommand } from "./datatypes/ScriptCommand";
import { ScriptCommandType } from "./DrodEnums";

/**
 * Across the versions DROD used different mechanism to pack script commands
 * into ExtraVars.
 */
export enum CommandListPackingType {
	/**
	 * @version 302+ Most modern, stores commands serialized into a buffer
	 * in "Commands" extra var
	 */
	SerializedIntoCommands,
	/**
	 * @version ? Same as above but stores them in "SerializedCommands" instead.
	 */
	SerializedIntoSerializedCommands,
	/**
	 * @version 301,302 In TCB the above serialization was changed to include
	 * flags and the fields are sorted alphabetically (so 1000c comes before
	 * 100c).
	 * Functionally the two "SeparateVars" methods are implemented identically
	 * because with this sort there was no consistency whether the command vars
	 * appear before or after other variables (like `ScriptID` or `visible`)
	 * so when repacking we update existing values.
	 */
	SeparateVarsAlphabeticallySorted,
	/**
	 * @version 201 In JtRH each command's field is stored as a separate extra
	 * var, eg. 0c, 0x, 0y, 0w, 0h, 0l and 0s (no flags). those are sorted
	 * numerically by index.
	 */
	SeparateVarsIndexSorted,
}

export class CommandsList {
	public readonly hold: Hold;
	public readonly commands: ReadonlyArray<ScriptCommand>;
	/**
	 * Different versions of DROD stored commands differently.
	 */
	public readonly packingType: CommandListPackingType;

	public wasModified: boolean = false;

	private _commandsWithSpeech?: ReadonlyArray<ScriptCommand>;
	private _commandsWithData?: ReadonlyArray<ScriptCommand>;

	public clearCache() {
		this._commandsWithData = undefined;
		this._commandsWithSpeech = undefined;
	}

	public constructor(hold: Hold, commandList: ScriptCommand[], packingType: CommandListPackingType) {
		this.hold = hold;
		this.commands = commandList;
		this.packingType = packingType;
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
			this._commandsWithSpeech = this.commands.filter(command => command.speechId.newValue);
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