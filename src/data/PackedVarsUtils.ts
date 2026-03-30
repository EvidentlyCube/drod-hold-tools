import { bytesArrToBase64 } from "../utils/StringUtils";
import { PackedVars, PackedVarType } from "./PackedVars";

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

	public readBool(varSize: number): boolean {
		let isTrue = false;
		for (let i = 0; i < varSize; i++) {
			if (this._array[this._pos + i]) {
				isTrue = true;
			}
		}

		this._pos += varSize;

		return isTrue;
	}

	public writeBool(bool: boolean, varSize: number) {
		this.writeUint(bool ? 1 : 0, varSize);
	}

	public readUint(varSize: number): number {
		const pos0 = varSize >= 1 ? this._array[this._pos + 0] : 0;
		const pos1 = varSize >= 2 ? this._array[this._pos + 1] : 0;
		const pos2 = varSize >= 3 ? this._array[this._pos + 2] : 0;
		const pos3 = varSize >= 4 ? this._array[this._pos + 3] : 0;

		this._pos += varSize;

		return pos0 + pos1 * 256 + pos2 * 256 * 256 + pos3 * 256 * 256 * 256;
	}

	public writeUint(val: number, varSize: number) {
		if (varSize >= 1) {
			this._array[this._pos++] = val & 0xff;
		}
		if (varSize >= 2) {
			this._array[this._pos++] = (val / 256) & 0xff;
		}
		if (varSize >= 3) {
			this._array[this._pos++] = (val / (256 * 256)) & 0xff;
		}
		if (varSize >= 4) {
			this._array[this._pos++] = (val / (256 * 256 * 256)) & 0xff;
		}

		this.padZeroBytes(varSize - 4);
	}

	public readInt(varSize: number): number {
		const pos0 = varSize >= 1 ? this._array[this._pos + 0] : 0;
		const pos1 = varSize >= 2 ? this._array[this._pos + 1] : 0;
		const pos2 = varSize >= 3 ? this._array[this._pos + 2] : 0;
		const pos3 = varSize >= 4 ? this._array[this._pos + 3] : 0;

		this._pos += varSize;

		return pos0 + pos1 * 256 + pos2 * 256 * 256 + pos3 * 256 * 256 * 256;
	}

	public writeInt(val: number, varSize: number) {
		if (varSize >= 1) {
			this._array[this._pos++] = val & 0xff;
		}
		if (varSize >= 2) {
			this._array[this._pos++] = (val / 256) & 0xff;
		}
		if (varSize >= 3) {
			this._array[this._pos++] = (val / (256 * 256)) & 0xff;
		}
		if (varSize >= 4) {
			this._array[this._pos++] = (val / (256 * 256 * 256)) & 0xff;
		}
		this.padZeroBytes(varSize - 4);
	}

	public readCharString(varSize: number): string {
		const chars = [];
		// -1 to skip null byte at the end
		for (let i = 0; i < varSize - 1; i++) {
			chars.push(String.fromCharCode(this._array[this._pos + i]));
		}

		this._pos += varSize;

		return chars.join("");
	}

	public readWcharString(varSize: number): string {
		const chars = [];
		// -2 because it's null terminated and we skip the last WCHAR
		for (let i = 0; i < varSize - 2; i += 2) {
			const codeUnit =
				this._array[this._pos + i] | (this._array[this._pos + i + 1] << 8);
			chars.push(String.fromCharCode(codeUnit));
		}

		this._pos += varSize;

		return chars.join("");
	}

	public writeString(str: string, varSize: number) {
		// -1 to leave space for null byte
		for (let i = 0; i < varSize - 1; i++) {
			const charCode = str.charCodeAt(i);
			if (charCode > 128) {
				throw new Error(`Trying to write char code ${charCode}`);
			}
			this._array[this._pos++] = charCode;
		}

		this._array[this._pos++] = 0;
	}

	public writeWCharString(str: string, varSize: number) {
		// -2 because null bytes at the end are not part of the string
		for (let i = 0; i < varSize - 2; i += 2) {
			// Division because we want to go character by character
			const charCode = str.charCodeAt(i / 2);
			this._array[this._pos++] = charCode & 0xff;
			this._array[this._pos++] = (charCode >> 8) & 0xff;
		}

		this._array[this._pos++] = 0;
		this._array[this._pos++] = 0;
	}

	public readRaw(bytes: number): number[] {
		const readBytes: number[] = [];

		while (bytes-- > 0 && this._pos < this._array.length) {
			readBytes.push(this._array[this._pos++]);
		}

		return readBytes;
	}

	public writeRaw(buffer: number[], bytesToWrite: number) {
		for (let i = 0; i < bytesToWrite; i++) {
			this._array[this._pos++] = buffer[i];
		}
	}

	private padZeroBytes(count: number) {
		for (let i = 0; i < count; i++) {
			this._array[this._pos++] = 0;
		}
	}
}

export function readPackedVars(base64ExtraVars: string): PackedVars;
export function readPackedVars(
	base64ExtraVars?: string,
): PackedVars | undefined;
export function readPackedVars(
	base64ExtraVars?: string,
): PackedVars | undefined {
	if (!base64ExtraVars) {
		return undefined;
	}

	return PackedVarsUtils.readBuffer(
		PackedVarsUtils.base64ToArray(base64ExtraVars),
	);
}

export function writePackedVars(packedVars: PackedVars): string {
	const buffer = PackedVarsUtils.writeBuffer(packedVars);

	return bytesArrToBase64(buffer);
}

const PackedVarsUtils = {
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
		let varNameLength = arr.readUint(4);

		while (varNameLength !== 0 && !Number.isNaN(varNameLength)) {
			if (varNameLength >= 256) {
				throw new Error(
					`Variable name cannot be more than 255 characters, but got ${varNameLength} instead`,
				);
			}

			const varName = arr.readCharString(varNameLength);
			if (!varName) {
				throw new Error(`Failed to read variable name`);
			}

			const varType = arr.readInt(4) as PackedVarType;
			const varSize = arr.readUint(4);

			switch (varType) {
				case PackedVarType.ByteBuffer:
					vars.writeByteBuffer(varName, arr.readRaw(varSize), varSize);
					break;
				case PackedVarType.Uint:
					vars.writeUint(varName, arr.readUint(varSize), varSize);
					break;
				case PackedVarType.deprecated_DWord:
					vars.writeDWord_deprecated(varName, arr.readUint(varSize), varSize);
					break;
				case PackedVarType.Int:
					vars.writeInt(varName, arr.readInt(varSize), varSize);
					break;
				case PackedVarType.Bool:
					vars.writeBool(varName, arr.readBool(varSize), varSize);
					break;
				case PackedVarType.WcharString:
					vars.writeWcharString(varName, arr.readWcharString(varSize), varSize);
					break;
				default:
					console.error(varName, varType, varSize, arr.readRaw(varSize));
					throw new Error(`Unknown packed var type ${varType}`);
			}

			varNameLength = arr.readUint(4);
		}

		return vars;
	},

	writeBuffer(packedVars: PackedVars) {
		const buf = new WrappedArray(new Uint8Array());

		for (const packedVar of packedVars.vars) {
			const { name, type, value, size } = packedVar;

			buf.writeUint(name.length + 1, 4);
			buf.writeString(name, name.length + 1);
			buf.writeInt(type, 4);
			buf.writeUint(size, 4);

			switch (type) {
				case PackedVarType.ByteBuffer: {
					if (!Array.isArray(value)) {
						throw new Error(
							`Expected ByteBuffer value to be number[] or Uint8Array for variable "${name}"`,
						);
					}
					buf.writeRaw(value, size);
					break;
				}
				case PackedVarType.Uint: {
					if (typeof value !== "number" || !Number.isFinite(value)) {
						throw new Error(
							`Expected Uint value to be a number for variable "${name}"`,
						);
					}
					buf.writeUint(value >>> 0, size);
					break;
				}
				case PackedVarType.deprecated_DWord: {
					if (typeof value !== "number" || !Number.isFinite(value)) {
						throw new Error(
							`Expected deprecated_DWord value to be a number for variable "${name}"`,
						);
					}
					buf.writeUint(value >>> 0, size);
					break;
				}
				case PackedVarType.Int: {
					if (typeof value !== "number" || !Number.isFinite(value)) {
						throw new Error(
							`Expected Int value to be a finite number for variable "${name}"`,
						);
					}
					buf.writeInt(value | 0, size);
					break;
				}
				case PackedVarType.Bool: {
					if (typeof value !== "boolean") {
						throw new Error(
							`Expected Bool value to be boolean for variable "${name}"`,
						);
					}
					buf.writeBool(value, size);
					break;
				}
				case PackedVarType.WcharString: {
					if (typeof value !== "string") {
						throw new Error(
							`Expected WcharString value to be string for variable "${name}"`,
						);
					}
					buf.writeWCharString(value, size);
					break;
				}
				default:
					console.error(name, type, value);
					throw new Error(`Unknown packed var type ${type}`);
			}
		}

		return buf.array;
	},
};
