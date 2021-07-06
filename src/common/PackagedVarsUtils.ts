import {PackedVars, PackedVarType} from "./PackedVars";

class WrappedArray {
	private readonly _array: number[];
	private _pos: number;

	public get array() {
		return this._array;
	}

	constructor(array: Uint8Array | number[]) {
		this._array = Array.from(array);
		this._pos = 0;
	}

	public readBool(): boolean {
		return this._array[this._pos++] > 0;
	}

	public writeBool(bool: boolean) {
		this._array[this._pos++] = bool ? 1 : 0;
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

	public writeUint(val: number) {
		this._array[this._pos++] = val & 0xFF;
		this._array[this._pos++] = (val / 256) & 0xFF;
		this._array[this._pos++] = (val / (256 * 256)) & 0xFF;
		this._array[this._pos++] = (val / (256 * 256 * 256)) & 0xFF;
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

	public writeInt(val: number) {
		this._array[this._pos++] = val & 0xFF;
		this._array[this._pos++] = (val / 255) & 0xFF;
		this._array[this._pos++] = (val / (255 * 255)) & 0xFF;
		this._array[this._pos++] = (val / (255 * 255 * 255)) & 0xFF;
	}

	public readString(characters: number): string {
		const chars = [];
		while (characters-- > 0 && this._pos < this._array.length) {
			chars.push(String.fromCharCode(this._array[this._pos++]));
		}

		return chars.filter(x => x !== '\u0000').join('');
	}

	public writeString(str: string) {
		for (let i = 0; i < str.length; i++) {
			const charCode = str.charCodeAt(i);
			if (charCode > 128) {
				throw new Error(`Trying to write char code ${charCode}`);
			}
			this._array[this._pos++] = charCode;
		}
		this._array[this._pos++] = 0;
	}

	public readRaw(bytes: number): number[] {
		const readBytes: number[] = [];

		while (bytes-- > 0 && this._pos < this._array.length) {
			readBytes.push(this._array[this._pos++]);
		}

		return readBytes;
	}

	public writeRaw(buffer: number[]) {
		for (let i = 0; i < buffer.length; i++) {
			this._array[this._pos++] = buffer[i];
		}
	}
}

export const PackedVarsUtils = {
	base64ToArray(base64: string) {
		const binary_string = window.atob(base64);
		const len = binary_string.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
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
					throw new Error(`Unknown packed var type ${varType}`);
			}

			varNameLength = arr.readUint();
		}

		return vars;
	},

	writeBuffer(packagedVars: PackedVars) {
		const buf = new WrappedArray(new Uint8Array());

		for (const packagedVar of packagedVars.vars) {
			const {name} = packagedVar;

			buf.writeUint(name.length + 1);
			buf.writeString(name);
			buf.writeInt(packagedVar.type);

			switch (packagedVar.type) {
				case PackedVarType.ByteBuffer:
					buf.writeUint(packagedVar.value.length);
					buf.writeRaw(packagedVar.value);
					break;
				case PackedVarType.Uint:
					buf.writeUint(4);
					buf.writeUint(packagedVar.value);
					break;
				case PackedVarType.Bool:
					buf.writeUint(1);
					buf.writeBool(packagedVar.value);
					break;
				default:
					console.log(name, packagedVar.type, packagedVar.value);
					throw new Error(`Unknown packed var type ${packagedVar.type}`);
			}
		}

		return buf.array;
	},
};