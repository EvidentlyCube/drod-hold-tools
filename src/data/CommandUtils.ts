import { UINT_MINUS_1 } from "./DrodCommonTypes";
import { ScriptCommandType, ScriptVarComparators, ScriptVarOperators } from "./DrodEnums";
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
		commands.push({ index, type, x, y, w, h, flags, speechId, label });
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
		arr.writeBpUint(command.overrideSpeechId ?? command.speechId);
		arr.writeBpUint(command.label.length ? command.label.length * 2 : 0);
		if (command.label) {
			arr.writeWChar(command.label);
		}
	}

	return buffer;
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

export function doesCommandUseVariable(command: ScriptCommand, variable: HoldVariable): boolean {
	switch (command.type) {
		case ScriptCommandType.CC_VarSet:
			return command.x === variable.id
				|| (command.y === ScriptVarOperators.AppendText && variable.isUsedInText(command.label))
				|| (command.y === ScriptVarOperators.AssignText && variable.isUsedInText(command.label))
				|| (
					command.y !== ScriptVarOperators.AssignText
					&& command.y !== ScriptVarOperators.AppendText
					&& variable.isUsedInFormula(command.label)
				);

		case ScriptCommandType.CC_WaitForVar:
			return command.x === variable.id
				|| (command.y === ScriptVarComparators.EqualsText && variable.isUsedInText(command.label))
				|| (command.y !== ScriptVarComparators.EqualsText && variable.isUsedInFormula(command.label));

		case ScriptCommandType.CC_ImageOverlay:
			return variable.isUsedInText(command.label);

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