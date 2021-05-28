import {PackedVars, PackedVarType} from "./PackedVars";


class WrappedArray {
	private _array: Uint8Array;
	private _pos: number;

	constructor(array: Uint8Array) {
		this._array = array;
		this._pos = 0;
	}

	public readBool(): boolean {
		return this._array[this._pos++] > 0;
	}

	public readUint(): number {
		const pos0 = this._array[this._pos++];
		const pos1 = this._array[this._pos++];
		const pos2 = this._array[this._pos++];
		const pos3 = this._array[this._pos++];

		return pos0
			+ (pos1 * 256)
			+ (pos2 * 256 * 256)
			+ (pos3 * 256 * 256 * 256);
	}

	public readInt(): number {
		const pos0 = this._array[this._pos++];
		const pos1 = this._array[this._pos++];
		const pos2 = this._array[this._pos++];
		const pos3 = this._array[this._pos++];

		return pos0
			+ (pos1 * 256)
			+ (pos2 * 256 * 256)
			+ (pos3 * 256 * 256 * 256);
	}

	public readString(characters: number): string {
		const chars = [];
		while (characters-- > 0 && this._pos < this._array.length) {
			chars.push(String.fromCharCode(this._array[this._pos++]));
		}

		return chars.filter(x => x !== '\u0000').join('');
	}

	public readRaw(bytes: number): number[] {
		const readBytes:number[] = [];

		while (bytes-- > 0 && this._pos < this._array.length) {
			readBytes.push(this._array[this._pos++]);
		}

		return readBytes;
	}
}

export const PackedVarsUtils = {
	base64ToArray(base64: string) {
		var binary_string = window.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes;
	},

	readBuffer(array: Uint8Array) {
		const vars = new PackedVars();
		if (array.length < 4) {
			return vars;
		}

		const arr = new WrappedArray(array);
		let varNameLength = arr.readUint();

		while (varNameLength !== 0 && !Number.isNaN(varNameLength)) {
			if (varNameLength >= 256) {
				throw new Error(`Variable name cannot be more than 255 characters, but got ${varNameLength} instead`);
			}

			const varName = arr.readString(varNameLength);
			if (!varName) {
				throw new Error(`Failed to read variable name`);
			}

			const varType = arr.readInt() as PackedVarType;
			const varSize = arr.readUint();

			switch (varType) {
				case PackedVarType.ByteBuffer:
					vars.writeByteBuffer(varName, arr.readRaw(varSize));
					break;
				case PackedVarType.Uint:
					vars.writeUint(varName, arr.readUint());
					break;
				case PackedVarType.Bool:
					vars.writeBool(varName, arr.readBool());
					break;
				default:
					console.log(varName, varType, varSize, arr.readRaw(varSize));
					throw new Error(`Unknown packed var type ${varType}`)
			}

			varNameLength = arr.readUint();
		}

		return vars;
	}
}