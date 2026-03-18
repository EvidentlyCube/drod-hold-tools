export enum PackedVarType {
	Byte = 0,
	CharString = 1,
	deprecated_DWord = 2,
	Int = 3,
	Uint = 5,
	WcharString = 6,
	ByteBuffer = 7,
	Bool = 8,
	Unknown = 9
}

type PackedVarValue = boolean | number | string | Uint8Array | number[];

interface PackedVar {
	name: string;
	type: PackedVarType;
	value: PackedVarValue;
}

export class PackedVars {
	private readonly _vars: PackedVar[];

	public get vars(): ReadonlyArray<PackedVar> {
		return this._vars;
	}

	constructor() {
		this._vars = [];
	}

	clone(): PackedVars {
		const newVars = new PackedVars();

		for (const packedVar of this._vars) {
			newVars._vars.push(structuredClone(packedVar));
		}

		return newVars;
	}

	writeInt(name: string, value: number) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.Int;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	writeUint(name: string, value: number) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.Uint;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	writeDWord(name: string, value: number) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.deprecated_DWord;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	writeBool(name: string, value: boolean) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.Bool;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	writeByteBuffer(name: string, value: number[]) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.ByteBuffer;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	writeString(name: string, value: string) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.CharString;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	writeWcharString(name: string, value: string) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.WcharString;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	readByteBuffer(name: string, def: number[]) {
		return this.readVar(name, PackedVarType.ByteBuffer, def) as number[];
	}

	readString(name: string, def: string) {
		return this.readVar(name, PackedVarType.CharString, def) as string;
	}

	readWCharString(name: string, def: string) {
		return this.readVar(name, PackedVarType.WcharString, def) as string;
	}

	readBool(name: string, def: boolean) {
		return this.readVar(name, PackedVarType.Bool, def) as boolean;
	}

	readUint(name: string, def: number) {
		return this.readVar(name, PackedVarType.Uint, def) as number;
	}

	readDWord_deprecated(name: string, def: number) {
		return this.readVar(name, PackedVarType.deprecated_DWord, def) as number;
	}

	delete(name: string) {
		const index = this._vars.findIndex(v => v.name === name);

		if (index !== -1) {
			this._vars.splice(index, 1);
		}
	}

	hasAnyVar() {
		return this._vars.length;
	}

	hasVar(name: string) {
		return this._vars.find(packedVar => packedVar.name === name) !== undefined;
	}

	private readVar(name: string, expectedType: PackedVarType, def: PackedVarValue): PackedVarValue {
		const [isFound, packedVar] = this.getVar(name);

		if (!isFound) {
			return def;

		} else if (packedVar.type !== expectedType) {
			console.warn(`Attempted to read packed var '${name}' with type ${expectedType} but its stored type was ${packedVar.type}`)
			return def;
		}

		return packedVar.value;
	}

	private getVar(name: string): [boolean, PackedVar] {
		for (const packedVar of this._vars) {
			if (packedVar.name === name) {
				return [true, packedVar];
			}
		}

		return [false, {name, value: 0, type: PackedVarType.Unknown}];
	}
}