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
	type: PackedVarType;
	value: any;
}

export class PackedVars {
	private _vars: Map<string, PackedVar>;

	constructor() {
		this._vars = new Map();
	}

	writeInt(name: string, value: number) {
		const packedVar = this._vars.get(name) || {} as PackedVar;

		packedVar.type = PackedVarType.Int;
		packedVar.value = value;

		this._vars.set(name, packedVar);
	}

	writeUint(name: string, value: number) {
		const packedVar = this._vars.get(name) || {} as PackedVar;

		packedVar.type = PackedVarType.Uint;
		packedVar.value = value;

		this._vars.set(name, packedVar);
	}

	writeBool(name: string, value: boolean) {
		const packedVar = this._vars.get(name) || {} as PackedVar;

		packedVar.type = PackedVarType.Bool;
		packedVar.value = value;

		this._vars.set(name, packedVar);
	}

	writeByteBuffer(name: string, value: number[]) {
		const packedVar = this._vars.get(name) || {} as PackedVar

		packedVar.type = PackedVarType.ByteBuffer;
		packedVar.value = value;

		this._vars.set(name, packedVar);
	}

	readByteBuffer(name: string, def: number[] | undefined) {
		return this.readVar(name, PackedVarType.ByteBuffer, def) as number[];
	}

	readBool(name: string, def: boolean|undefined) {
		return this.readVar(name, PackedVarType.Bool, def) as boolean;
	}

	readUint(name: string, def: number|undefined) {
		return this.readVar(name, PackedVarType.Uint, def) as number;
	}

	private readVar(name: string, expectedType: PackedVarType, def: any) {
		const packedVar = this._vars.get(name);

		if (!packedVar || packedVar.type !== expectedType) {
			return def;
		}

		return packedVar.value;
	}
}