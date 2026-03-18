import { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";
import { CommandsList } from "../CommandList";
import { packJtrhCommands, readCommandsBuffer, unpackJtrhCommands } from "../CommandUtils";
import { PackedVars } from "../PackedVars";
import { readPackedVars } from "../PackedVarsUtils";
import { HoldRef } from "../references/HoldReference";
import { getCharacterName, wcharBase64ToString } from "../Utils";
import type { Hold } from "./Hold";

interface CharacterConstructor {
	id: number;
	encName: string;
	type: number;
	animationSpeed?: number;
	encExtraVars?: string;
	tilesDataId?: number
	avatarDataId?: number
}
export class HoldCharacter {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly name: SignalUpdatableValue<string>;
	public readonly type: number;
	public readonly animationSpeed?: number;
	public readonly extraVars?: PackedVars;
	public readonly tilesDataId: SignalUpdatableValue<number | undefined>;
	public readonly avatarDataId: SignalUpdatableValue<number | undefined>;

	public readonly $commandList?: CommandsList;

	public readonly $uses: HoldRef[] = [];

	public get $baseTypeName() {
		return getCharacterName(this.$hold, this.type);
	}

	public get $avatarData() {
		return this.avatarDataId.newValue ? this.$hold.datas.getOrError(this.avatarDataId.newValue) : undefined;
	}

	public get $tilesData() {
		return this.tilesDataId.newValue ? this.$hold.datas.getOrError(this.tilesDataId.newValue) : undefined;
	}

	public constructor(hold: Hold, options: CharacterConstructor) {
		this.$hold = hold;

		this.id = options.id;
		this.name = new SignalUpdatableValue(wcharBase64ToString(options.encName));
		this.type = options.type;
		this.animationSpeed = options.animationSpeed;
		this.extraVars = readPackedVars(options.encExtraVars);
		this.tilesDataId = new SignalUpdatableValue(options.tilesDataId);
		this.avatarDataId = new SignalUpdatableValue(options.avatarDataId);

		if (this.extraVars) {
			if (this.$hold.version.characterCommandsStoredInMultipleVars) {
				const commands = unpackJtrhCommands(this.extraVars);

				this.$commandList = commands.length > 0
					? new CommandsList(this.$hold, commands)
					: undefined;
			}

			if (this.$hold.version.characterCommandsStoredInCommands && this.extraVars.hasVar('Commands')) {
				this.$commandList = new CommandsList(this.$hold, readCommandsBuffer(this.extraVars.readByteBuffer('Commands', [])));
			}
		}
	}

	public repackCommandsIntoExtraVars() {
		if (this.$commandList && this.extraVars) {
			if (this.$hold.version.characterCommandsStoredInMultipleVars) {
				packJtrhCommands(this.$commandList, this.extraVars);

			} else {
				this.extraVars.writeByteBuffer('Commands', this.$commandList.toByteArray());
			}
		}
	}
}