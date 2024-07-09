import { UINT_MINUS_1 } from "./DrodCommonTypes";
import { ScriptCommandType } from "./DrodEnums";
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

		const index = commands.length + 1;
		commands.push({ index, type, x, y, w, h, flags, speechId, label});
	}

	return commands;
}

/*
	writeCommandsBuffer(commands: Command[]) {
		const buffer: number[] = [];

		const arr = new WrappedCommandBuffer(buffer);
		for (const command of commands) {
			arr.writeBpUint(command.command);
			arr.writeBpUint(command.x);
			arr.writeBpUint(command.y);
			arr.writeBpUint(command.w);
			arr.writeBpUint(command.h);
			arr.writeBpUint(command.flags);
			arr.writeBpUint(command.speechId);
			arr.writeBpUint(command.label.length ? command.label.length * 2 : 0);
			arr.writeWChar(command.label);
		}

		return buffer;
	},

	doesRequireSpeech(command: CharCommand) {
		return command === CharCommand.CC_Speech
			|| command === CharCommand.CC_FlashingText
			|| command === CharCommand.CC_AnswerOption
			|| command === CharCommand.CC_Question
			|| command === CharCommand.CC_RoomLocationText;
	},
};
*/

function doesCommandHaveData(type: ScriptCommandType) {
	switch (type)
	{
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

export function getCommandDataId(command: ScriptCommand) {
	const {type} = command;
	if (!doesCommandHaveData(type)) {
		return 0;

	} else if (isMusicCommand(type)) {
		return command.y;

	} else if (type === ScriptCommandType.CC_WorldMapImage) {
		return command.h;
	}

	return command.w;
}