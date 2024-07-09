import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { CommandsList } from "../CommandList";
import { readCommandsBuffer } from "../CommandUtils";
import { PackedVars } from "../PackedVars";
import { readPackedVars } from "../PackedVarsUtils";
import { getCharacterName, wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface CharacterConstructor {
	id: number;
	encName: string;
	type: number;
	animationSpeed: number;
	encExtraVars?: string;
	tilesDataId?: number
	avatarDataId?: number
}
export class HoldCharacter {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly name: SignalUpdatableValue<string>;
	public readonly type: number;
	public readonly animationSpeed: number;
	public readonly extraVars?: PackedVars;
	public readonly tilesDataId?: number
	public readonly avatarDataId?: number

	public readonly $commandList?: CommandsList;

	public get $baseTypeName() {
		return getCharacterName(this.$hold, this.type);
	}

	public constructor(hold: Hold, options: CharacterConstructor) {
		this.$hold = hold;

		this.id = options.id;
		this.name = new SignalUpdatableValue(wcharBase64ToString(options.encName));
		this.type = options.type;
		this.animationSpeed = options.animationSpeed;
		this.extraVars = readPackedVars(options.encExtraVars);
		this.tilesDataId = options.tilesDataId;
		this.avatarDataId = options.avatarDataId;

		if (this.extraVars && this.extraVars.hasVar('Commands')) {
			this.$commandList = new CommandsList(hold, readCommandsBuffer(this.extraVars.readByteBuffer('Commands', [])));
		}
	}
}