import {Command} from "../data/Command";

class WrappedBuffer {
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

	public readString(characters: number): string {
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

		return n - 0x80;
	}

	public get isEnd() {
		return this._index >= this._buffer.length;
	}
}

export const CommandsUtils = {
	readCommandsBuffer: (buffer: number[]) => {
		const commands: Command[] = [];
		if (buffer.length === 0) {
			return commands;
		}

		const arr = new WrappedBuffer(buffer);

		while (!arr.isEnd) {
			const command = arr.readBpUint();
			const x = arr.readBpUint();
			const y = arr.readBpUint();
			const w = arr.readBpUint();
			const h = arr.readBpUint();
			const flags = arr.readBpUint();
			const speechId = arr.readBpUint();
			const labelSize = arr.readBpUint();
			const label = labelSize > 0 ? arr.readString(labelSize) : '';

			commands.push({command, x, y, w, h, flags, speechId, label});
		}

		return commands;
	},
};