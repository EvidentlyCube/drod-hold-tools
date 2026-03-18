import { SignalUpdatableValue } from "../utils/SignalUpdatableValue";
import { CommandsList } from "./CommandList";
import { UINT_MINUS_1 } from "./DrodCommonTypes";
import { ScriptCommandType, ScriptVarComparators, ScriptVarOperators } from "./DrodEnums";
import { PackedVars } from "./PackedVars";
import { HoldCharacter } from "./datatypes/HoldCharacter";
import { HoldVariable } from "./datatypes/HoldVariable";
import { ScriptCommand } from "./datatypes/ScriptCommand";

class WrappedCommandBuffer {
	private _buffer: number[];
	private _index: number;

	constructor(buffer: number[]) {
		this._buffer = buffer;
		this._index = 0;
	}

	public get index() {
		return this._index;
	}

	public get length() {
		return this._buffer.length;
	}

	public readWChar(characters: number): string {
		const chars = [];
		while (characters-- > 0 && this._index < this._buffer.length) {
			chars.push(String.fromCharCode(this._buffer[this._index++]));
		}

		return chars.filter(x => x !== '\u0000').join('');
	}

	public readBpUint() {
		let index = this._index;
		let index2 = index++;

		let n = 0;

		do {
			n = (n << 7) + this._buffer[index2];

			if (this._buffer[index2++] & 0x80 || index2 >= this.length)
				break;

			index++;

		} while (true);

		this._index = index;

		const res = n - 0x80;

		return res < 0
			? res + UINT_MINUS_1 + 1
			: res;
	}

	public writeBpUint(n: number) {
		let s = 7;
		while ((n >> s) && s < 32)
			s += 7;

		while (s) {
			s -= 7;
			let divider = Math.pow(2, s);
			let b = (n / divider) & 0x7f;
			if (!s)
				b |= 0x80;

			this._buffer[this._index++] = b;
		}
	}

	public writeWChar(s: string) {
		for (let i = 0; i < s.length; i++) {
			const charCode = s.charCodeAt(i);
			if (charCode > 128) {
				throw new Error(`CommandBuffer Writing WChar: Unsupported wchar with code ${charCode}`);
			}

			this._buffer[this._index++] = charCode;
			this._buffer[this._index++] = 0;
		}
	}

	public get isEnd() {
		return this._index >= this._buffer.length;
	}
}

export function readCommandsBuffer(buffer: number[]) {
	const commands: ScriptCommand[] = [];
	if (buffer.length === 0) {
		return commands;
	}

	const arr = new WrappedCommandBuffer(buffer);

	while (!arr.isEnd) {
		const type = arr.readBpUint();
		const x = arr.readBpUint();
		const y = arr.readBpUint();
		const w = arr.readBpUint();
		const h = arr.readBpUint();
		const flags = arr.readBpUint();
		const speechId = arr.readBpUint();
		const labelSize = arr.readBpUint();
		const label = labelSize > 0 ? arr.readWChar(labelSize) : '';

		const index = commands.length;
		commands.push({
			index, type, x, y, w, h, flags,
			speechId: new SignalUpdatableValue(speechId),
			label: new SignalUpdatableValue(label)
		});
	}

	return commands;
}

export function writeCommandsBuffer(commands: ReadonlyArray<ScriptCommand>) {
	const buffer: number[] = [];

	const arr = new WrappedCommandBuffer(buffer);
	for (const command of commands) {
		arr.writeBpUint(command.type);
		arr.writeBpUint(command.x);
		arr.writeBpUint(command.y);
		arr.writeBpUint(command.w);
		arr.writeBpUint(command.h);
		arr.writeBpUint(command.flags);
		arr.writeBpUint(command.speechId.newValue);
		arr.writeBpUint(command.label.newValue.length * 2);
		if (command.label.newValue) {
			arr.writeWChar(command.label.newValue);
		}
	}

	return buffer;
}

export function unpackJtrhCommands(packedVars: PackedVars): ScriptCommand[] {
	const numCommands = packedVars.readUint('NumCommands', 0);
	const commands: ScriptCommand[] = [];

	for (let i = 0; i < numCommands; i++) {
		commands.push({
			index: i,
			type: packedVars.readUint(`${i}c`, 0),
			x: packedVars.readUint(`${i}x`, 0),
			y: packedVars.readUint(`${i}y`, 0),
			w: packedVars.readUint(`${i}w`, 0),
			h: packedVars.readUint(`${i}h`, 0),
			flags: packedVars.readUint(`${i}f`, 0),
			label: new SignalUpdatableValue(packedVars.readWCharString(`${i}l`, '')),
			speechId: new SignalUpdatableValue(packedVars.readDWord_deprecated(`${i}s`, 0))
		});
	}

	return commands;
}

export function packJtrhCommands(commandList: CommandsList, packedVars: PackedVars): void {
	const { version } = commandList.hold;

	// First remove the existing commands
	const existingCommands = packedVars.vars
		.map(v => v.name)
		.filter(n => n.match(/^\d+[cxywhlsf]$/));

	for (const name of existingCommands) {
		packedVars.delete(name);
	}

	// And then pack them again
	packedVars.writeUint('NumCommands', commandList.commands.length)
	for (let i = 0; i < commandList.commands.length; i++) {
		const command = commandList.commands[i];

		if (version.characterCommandsStoredInMultipleVars_normalOrdering) {
			packedVars.writeUint(`${i}c`, command.type);
			packedVars.writeUint(`${i}x`, command.x);
			packedVars.writeUint(`${i}y`, command.y);
			packedVars.writeUint(`${i}w`, command.w);
			packedVars.writeUint(`${i}h`, command.h);
			packedVars.writeWcharString(`${i}l`, command.label.newValue);
			packedVars.writeUint(`${i}s`, command.speechId.newValue);
		}
		// packedVars.writeUint(`${i}f`, command.flags);
	}
}

function doesCommandHaveData(type: ScriptCommandType) {
	switch (type) {
		case ScriptCommandType.CC_AmbientSound:
		case ScriptCommandType.CC_AmbientSoundAt:
		case ScriptCommandType.CC_PlayVideo:
		case ScriptCommandType.CC_SetMusic:
		case ScriptCommandType.CC_WorldMapMusic:
		case ScriptCommandType.CC_ImageOverlay:
		case ScriptCommandType.CC_WorldMapImage:
			return true;
		default:
			return false;
	}
}

function isMusicCommand(type: ScriptCommandType) {
	return type === ScriptCommandType.CC_SetMusic || type === ScriptCommandType.CC_WorldMapMusic;
}

export function getCommandDataId(command: ScriptCommand): number {
	const { type } = command;
	if (!doesCommandHaveData(type)) {
		return 0;

	} else if (isMusicCommand(type)) {
		return command.y;

	} else if (type === ScriptCommandType.CC_WorldMapImage) {
		return command.h;
	}

	return command.w;
}

/**
 * @returns True if the command stores text in `label` that can be expanded
 * by variables.
 */
export function doesCommandStoreExpandableTextInLabel(command: ScriptCommand): boolean {
	switch (command.type) {
		case ScriptCommandType.CC_VarSet:
			return command.y === ScriptVarOperators.AppendText || command.y === ScriptVarOperators.AssignText;

		case ScriptCommandType.CC_WaitForVar:
			return command.y === ScriptVarComparators.EqualsText;

		case ScriptCommandType.CC_ImageOverlay:
			return true;

		default:
			return false;
	}
}

/**
 * @returns True if the command stores a mathematical formula in `label` that
 * can be use variables.
 */
export function doesCommandStoreFormulaInLabel(command: ScriptCommand): boolean {
	switch (command.type) {
		case ScriptCommandType.CC_VarSet:
			return command.y !== ScriptVarOperators.AppendText && command.y !== ScriptVarOperators.AssignText;

		case ScriptCommandType.CC_WaitForVar:
			return command.y !== ScriptVarComparators.EqualsText;

		default:
			return false;
	}
}

export function doesCommandUseVariable(command: ScriptCommand, variable: HoldVariable): boolean {
	switch (command.type) {
		case ScriptCommandType.CC_VarSet:
			return command.x === variable.id
				|| (command.y === ScriptVarOperators.AppendText && variable.isUsedInText(command.label.newValue))
				|| (command.y === ScriptVarOperators.AssignText && variable.isUsedInText(command.label.newValue))
				|| (
					command.y !== ScriptVarOperators.AssignText
					&& command.y !== ScriptVarOperators.AppendText
					&& variable.isUsedInFormula(command.label.newValue)
				);

		case ScriptCommandType.CC_WaitForVar:
			return command.x === variable.id
				|| (command.y === ScriptVarComparators.EqualsText && variable.isUsedInText(command.label.newValue))
				|| (command.y !== ScriptVarComparators.EqualsText && variable.isUsedInFormula(command.label.newValue));

		case ScriptCommandType.CC_ImageOverlay:
			return variable.isUsedInText(command.label.newValue);

		default:
			return false;
	}
}

export function doesCommandUseCharacter(command: ScriptCommand, character: HoldCharacter): boolean {
	switch (command.type) {
		case ScriptCommandType.CC_GenerateEntity:
		case ScriptCommandType.CC_WorldMapIcon:
			return command.h === character.id;

		case ScriptCommandType.CC_SetNPCAppearance:
		case ScriptCommandType.CC_SetPlayerAppearance:
		case ScriptCommandType.CC_StartGlobalScript:
		case ScriptCommandType.CC_WaitForEntityType:
			return command.x === character.id;

		case ScriptCommandType.CC_WaitForEntityType:
		case ScriptCommandType.CC_WaitForNotEntityType:
			return command.flags === character.id;

		default:
			return false;
	}
}

export function doesCommandUseSpeech(commandType: ScriptCommandType): boolean {
	// To be forward compatible we use a blacklist of known commands that don't
	// use speech to make sure we don't accidentally allow deleting speech
	// from commands that require it.

	switch (commandType) {
		case ScriptCommandType.CC_ActivateItemAt:
		case ScriptCommandType.CC_AmbientSound:
		case ScriptCommandType.CC_AmbientSoundAt:
		case ScriptCommandType.CC_Appear:
		case ScriptCommandType.CC_AppearAt:
		case ScriptCommandType.CC_AttackTile:
		case ScriptCommandType.CC_Build:
		case ScriptCommandType.CC_BuildMarker:
		case ScriptCommandType.CC_ChallengeCompleted:
		case ScriptCommandType.CC_CutScene:
		case ScriptCommandType.CC_DestroyTrapdoor:
		case ScriptCommandType.CC_Disappear:
		case ScriptCommandType.CC_DisplayFilter:
		case ScriptCommandType.CC_EndScript:
		case ScriptCommandType.CC_EndScriptOnExit:
		case ScriptCommandType.CC_FaceDirection:
		case ScriptCommandType.CC_FaceTowards:
		case ScriptCommandType.CC_FlushSpeech:
		case ScriptCommandType.CC_GameEffect:
		case ScriptCommandType.CC_GenerateEntity:
		case ScriptCommandType.CC_GetEntityDirection:
		case ScriptCommandType.CC_GetNaturalTarget:
		case ScriptCommandType.CC_GoSub:
		case ScriptCommandType.CC_GoTo:
		case ScriptCommandType.CC_GotoIf:
		case ScriptCommandType.CC_If:
		case ScriptCommandType.CC_IfElse:
		case ScriptCommandType.CC_IfElseIf:
		case ScriptCommandType.CC_IfEnd:
		case ScriptCommandType.CC_ImageOverlay:
		case ScriptCommandType.CC_Imperative:
		case ScriptCommandType.CC_Label:
		case ScriptCommandType.CC_LevelEntrance:
		case ScriptCommandType.CC_MoveRel:
		case ScriptCommandType.CC_MoveTo:
		case ScriptCommandType.CC_PlayerEquipsWeapon:
		case ScriptCommandType.CC_PlayVideo:
		case ScriptCommandType.CC_Return:
		case ScriptCommandType.CC_SetMusic:
		case ScriptCommandType.CC_SetNPCAppearance:
		case ScriptCommandType.CC_SetPlayerAppearance:
		case ScriptCommandType.CC_SetPlayerStealth:
		case ScriptCommandType.CC_SetPlayerWeapon:
		case ScriptCommandType.CC_SetWaterTraversal:
		case ScriptCommandType.CC_StartGlobalScript:
		case ScriptCommandType.CC_TeleportPlayerTo:
		case ScriptCommandType.CC_TeleportTo:
		case ScriptCommandType.CC_TurnIntoMonster:
		case ScriptCommandType.CC_VarSet:
		case ScriptCommandType.CC_Wait:
		case ScriptCommandType.CC_WaitForCharacter:
		case ScriptCommandType.CC_WaitForCleanLevel:
		case ScriptCommandType.CC_WaitForCleanRoom:
		case ScriptCommandType.CC_WaitForCueEvent:
		case ScriptCommandType.CC_WaitForDoorTo:
		case ScriptCommandType.CC_WaitForEntityType:
		case ScriptCommandType.CC_WaitForHalph:
		case ScriptCommandType.CC_WaitForItem:
		case ScriptCommandType.CC_WaitForMonster:
		case ScriptCommandType.CC_WaitForNoBuilding:
		case ScriptCommandType.CC_WaitForNotCharacter:
		case ScriptCommandType.CC_WaitForNotEntityType:
		case ScriptCommandType.CC_WaitForNotHalph:
		case ScriptCommandType.CC_WaitForNotMonster:
		case ScriptCommandType.CC_WaitForNotRect:
		case ScriptCommandType.CC_WaitForOpenMove:
		case ScriptCommandType.CC_WaitForPlayerInput:
		case ScriptCommandType.CC_WaitForPlayerToFace:
		case ScriptCommandType.CC_WaitForPlayerToMove:
		case ScriptCommandType.CC_WaitForPlayerToTouchMe:
		case ScriptCommandType.CC_WaitForRect:
		case ScriptCommandType.CC_WaitForSomeoneToPushMe:
		case ScriptCommandType.CC_WaitForTurn:
		case ScriptCommandType.CC_WaitForVar:
		case ScriptCommandType.CC_WorldMapIcon:
		case ScriptCommandType.CC_WorldMapImage:
		case ScriptCommandType.CC_WorldMapMusic:
		case ScriptCommandType.CC_WorldMapSelect:
			return false;


		// ScriptCommandType.CC_Speech
		// ScriptCommandType.CC_FlashingText
		// ScriptCommandType.CC_AnswerOption
		// ScriptCommandType.CC_Question
		// ScriptCommandType.CC_RoomLocationText;
		// And any new command that gets added
		default:
			return true
	}
}
