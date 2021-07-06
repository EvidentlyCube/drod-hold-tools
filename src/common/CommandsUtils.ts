import {Character} from "../data/Character";
import {Command} from "../data/Command";
import {Monster} from "../data/Monster";
import {UINT_MINUS_1} from "./CommonTypes";
import {CharCommand} from "./Enums";

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
			const charcode = s.charCodeAt(i);
			if (charcode > 128) {
				throw new Error(`Unssuported wchar with code ${charcode}`);
			}

			this._buffer[this._index++] = charcode;
			this._buffer[this._index++] = 0;
		}
	}

	public get isEnd() {
		return this._index >= this._buffer.length;
	}
}

export const CommandsUtils = {
	readCommandsBuffer(buffer: number[], source: Monster | Character) {
		const commands: Command[] = [];
		if (buffer.length === 0) {
			return commands;
		}

		const arr = new WrappedCommandBuffer(buffer);

		while (!arr.isEnd) {
			const command = arr.readBpUint();
			const x = arr.readBpUint();
			const y = arr.readBpUint();
			const w = arr.readBpUint();
			const h = arr.readBpUint();
			const flags = arr.readBpUint();
			const speechId = arr.readBpUint();
			const labelSize = arr.readBpUint();
			const label = labelSize > 0 ? arr.readWChar(labelSize) : '';

			commands.push({command, x, y, w, h, flags, speechId, label, source, changes: {}});
		}

		return commands;
	},


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