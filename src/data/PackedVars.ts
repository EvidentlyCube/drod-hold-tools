export enum PackedVarType {
	Byte = 0,
	CharString = 1,
	Int = 3,
	Uint = 5,
	WcharString = 6,
	ByteBuffer = 7,
	Bool = 8,
	Unknown = 9
}

interface PackedVar {
	name: string;
	type: PackedVarType;
	value: any;
}

export class PackedVars {
	private readonly _vars: PackedVar[];

	public get vars(): ReadonlyArray<PackedVar> {
		return this._vars;
	}

	constructor() {
		this._vars = [];
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

	writeWcharString(name: string, value: string) {
		const [isFound, packedVar] = this.getVar(name);

		packedVar.type = PackedVarType.WcharString;
		packedVar.value = value;

		!isFound && this._vars.push(packedVar);
	}

	readByteBuffer(name: string, def?: number[]) {
		return this.readVar(name, PackedVarType.ByteBuffer, def) as number[];
	}

	readBool(name: string, def?: boolean) {
		return this.readVar(name, PackedVarType.Bool, def) as boolean;
	}

	readUint(name: string, def?: number) {
		return this.readVar(name, PackedVarType.Uint, def) as number;
	}

	hasAnyVar() {
		return this._vars.length;
	}

	hasVar(name: string) {
		return this._vars.find(packedVar => packedVar.name === name) !== undefined;
	}

	private readVar(name: string, expectedType: PackedVarType, def: any) {
		const [isFound, packedVar] = this.getVar(name);

		if (!isFound || packedVar.type !== expectedType) {
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