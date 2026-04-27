import type { CommandsList } from "./CommandList";
import { INT_MAX, UINT_MAX } from "./DrodCommonTypes";
import {
	type AttackTileType,
	Mood,
	OrbAgentType,
	ScriptVarComparators,
	ScriptVarOperators,
} from "./DrodEnums";
import {
	AttackTileTypeToName,
	BehaviorToName,
	CommandInputToName,
	CueEventTypeToName,
	GameEffectTypeToName,
	ImperativeToName,
	LightColorToName,
	MonsterIdToName,
	MoodToName,
	MovementTypeToName,
	NaturalTargetTypeToName,
	OrientationToName,
	PlayerBehaviorStateToName,
	PlayerBehaviorToName,
	PlayerStateToName,
	PredefinedVariableToName,
	ScreenFilterToName,
	StealthTypeToName,
	TileGroupToName,
	TileTypeToName,
	WaitForFlagToName,
	WaterTraversalToName,
	WeaponTypeFlagToName,
	WeaponTypeToName,
	WorldMapIconToName,
} from "./DrodEnumToName";
import type { Hold } from "./datatypes/Hold";
import type { ScriptCommand } from "./datatypes/ScriptCommand";

function bitMask(bitField: number, callback: (id: number) => string): string[] {
	const results: string[] = [];
	let bitMask = 1;
	for (let bit = 0; bit < 32; ++bit, bitMask *= 2) {
		if ((bitField & bitMask) === bitMask) {
			results.push(callback(bitMask));
		}
	}

	return results;
}

export const TextUtils = {
	appearancePlayer(id: number, hold: Hold): string {
		return TextUtils.entity(id, hold);
	},
	appearanceMonster(id: number, hold: Hold): string {
		return TextUtils.entity(id, hold);
	},
	behavior(id: number): string {
		return BehaviorToName.get(id) ?? `UnknownBehavior_${id}`;
	},
	dataName(id: number, hold: Hold): string {
		return `"${hold.datas.get(id)?.name.newValue ?? id}"`;
	},
	playerBehavior(id: number): string {
		return PlayerBehaviorToName.get(id) ?? `UnknownPlayerBehavior_${id}`;
	},
	playerBehaviorState(id: number): string {
		return (
			PlayerBehaviorStateToName.get(id) ?? `UnknownPlayerBehaviorState_${id}`
		);
	},
	playerState(id: number): string {
		return PlayerStateToName.get(id) ?? `UnknownPlayerState_${id}`;
	},
	tile(id: number): string {
		return TileTypeToName.get(id) ?? `UnknownTileType_${id}`;
	},
	tileGroup(id: number): string {
		return TileGroupToName.get(id) ?? `UnknownTileGroup_${id}`;
	},
	entity(id: number, hold: Hold): string {
		return (
			MonsterIdToName.get(id)
			?? hold.characters.get(id)?.name.newValue
			?? `UnknownEntity_${id}`
		);
	},
	entityIdFromName(name: string, hold: Hold): number | undefined {
		for (const character of hold.characters.values()) {
			if (character.name.newValue === name) {
				return character.id;
			}
		}

		for (const [id, monsterName] of MonsterIdToName.entries()) {
			if (monsterName === name) {
				return id;
			}
		}

		return undefined;
	},
	monster(id: number): string {
		return MonsterIdToName.get(id) ?? `UnknownMonster_${id};`;
	},
	movementType(id: number): string {
		return MovementTypeToName.get(id) ?? `UnknownMovementType_${id}`;
	},
	displayFilter(id: number): string {
		return ScreenFilterToName.get(id) ?? `UnknownScreenFilter_${id}`;
	},
	dir(id: number): string {
		return OrientationToName.get(id) ?? `UnknownDirection_${id}`;
	},
	effect(id: number): string {
		return GameEffectTypeToName.get(id) ?? `UnknownGameEffect_${id}`;
	},
	wait(id: number): string {
		return WaitForFlagToName.get(id) ?? `UnknownWaitForTarget_${id}`;
	},
	natTarget(id: number): string {
		return NaturalTargetTypeToName.get(id) ?? `UnknownNaturalTargetType_${id}`;
	},
	openClose(id: number): string {
		if (id === OrbAgentType.Open) {
			return "Open";
		} else if (id === OrbAgentType.Close) {
			return "Close";
		} else if (id === OrbAgentType.Toggle) {
			return "toggle";
		} else {
			return `UnknownOpenCloseFlag_${id}`;
		}
	},
	stealth(id: number): string {
		return StealthTypeToName.get(id) ?? `UnknownStealthType_${id}`;
	},
	waterTraversal(id: number): string {
		return WaterTraversalToName.get(id) ?? `UnknownWaterTraversalType_${id}`;
	},
	weapon(id: number): string {
		return WeaponTypeToName.get(id) ?? `UnknownWeaponType_${id}`;
	},
	weaponFlag(id: number): string {
		return WeaponTypeFlagToName.get(id) ?? `UnknownWeaponTypeFlag_${id}`;
	},
	weaponFlags(bitField: number): string {
		return bitMask(bitField, TextUtils.weaponFlag).join(" ");
	},
	event(id: number): string {
		return CueEventTypeToName.get(id) ?? `UnknownCueEvent_${id}`;
	},
	input(id: number): string {
		return CommandInputToName.get(id) ?? `UnknownCommandInput_${id}`;
	},
	worldMapIcon(id: number): string {
		return WorldMapIconToName.get(id) ?? `UnknownWorldMapIcon_${id}`;
	},
	moodName(mood: number): string {
		return MoodToName.get(mood) ?? "Normal";
	},
	moodFromName(moodName: string): number {
		moodName = moodName.toLowerCase().trim();
		for (const [mood, name] of MoodToName.entries()) {
			if (name.toLowerCase().trim() === moodName) {
				return mood;
			}
		}

		return Mood.Normal;
	},
	imperative(id: number): string {
		return ImperativeToName.get(id) ?? `UnknownImperative_${id}`;
	},
	stripNewline(text: string): string {
		return text.replace(/\n|\r/g, " ");
	},
	lightColor(id: number): string {
		return LightColorToName.get(id) ?? `UnknownLightColor_${id}`;
	},
	join(items: (string | number)[]): string {
		return items
			.filter(x => x !== null && x !== undefined && x !== "")
			.join("");
	},
	waitFlags(id: number): string {
		return bitMask(id, TextUtils.wait).join(" ");
	},
	attack(id: AttackTileType): string {
		return AttackTileTypeToName.get(id) ?? `UnknownAttackTileType_${id}`;
	},
	xy(command: ScriptCommand): string {
		return `${TextUtils.uintToInt(command.x)},${TextUtils.uintToInt(command.y)}`;
	},
	wh(command: ScriptCommand): string {
		return `${TextUtils.uintToInt(command.w)},${TextUtils.uintToInt(command.h)}`;
	},
	xywh(command: ScriptCommand): string {
		return `(${TextUtils.uintToInt(command.x)},${TextUtils.uintToInt(command.y)}),(${TextUtils.uintToInt(command.x + command.w)},${TextUtils.uintToInt(command.y + command.h)})`;
	},
	onOff(value: number): string {
		return value ? "On" : "Off";
	},
	hex(value: number): string {
		return value.toString(16).padStart(2, "0");
	},
	variable(id: number, hold: Hold) {
		return (
			PredefinedVariableToName.get(id)
			?? hold.variables.get(id)?.name.newValue
			?? `UnknownVariable_${id}`
		);
	},
	scriptVarOp(op: ScriptVarOperators): string {
		switch (op) {
			case ScriptVarOperators.Assign:
				return "=";
			case ScriptVarOperators.Inc:
				return "+";
			case ScriptVarOperators.Dec:
				return "-";
			case ScriptVarOperators.AssignText:
				return ":";
			case ScriptVarOperators.AppendText:
				return ";";
			case ScriptVarOperators.MultiplyBy:
				return "*";
			case ScriptVarOperators.DivideBy:
				return "/";
			case ScriptVarOperators.Mod:
				return "%";
			default:
				return "?";
		}
	},
	scriptVarComp(comp: ScriptVarComparators): string {
		switch (comp) {
			case ScriptVarComparators.Equals:
				return "=";
			case ScriptVarComparators.Greater:
				return ">";
			case ScriptVarComparators.Less:
				return "<";
			case ScriptVarComparators.EqualsText:
				return "=";
			case ScriptVarComparators.LessThanOrEqual:
				return "<=";
			case ScriptVarComparators.GreaterThanOrEqual:
				return ">=";
			case ScriptVarComparators.Unequal:
				return "!=";
			default:
				return "?";
		}
	},
	arrayVarSet(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			"Set array var ",
			TextUtils.variable(c.w, context.hold),
			`[${c.flags}] `,
			`${TextUtils.scriptVarOp(c.h)} `,
			c.label.newValue,
		]);
	},
	arrayVarSetAt(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			"Set array var ",
			TextUtils.variable(c.w, context.hold),
			`[${c.flags}] `,
			`at ${TextUtils.xy(c)}`,
			`${TextUtils.scriptVarOp(c.h)} `,
			c.label.newValue,
		]);
	},
	varSet(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			"Set var ",
			`"${TextUtils.variable(c.x, context.hold)}" `,
			`${TextUtils.scriptVarOp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? "" : TextUtils.uintToInt(c.w).toString(),
		]);
	},
	varSetAt(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			"Set var ",
			TextUtils.xy(c),
			` "${TextUtils.variable(c.w, context.hold)}" `,
			`${TextUtils.scriptVarOp(c.h)} `,
			c.label.newValue,
			c.label.newValue ? "" : TextUtils.uintToInt(c.flags).toString(),
		]);
	},
	waitForOpenTile(c: ScriptCommand) {
		return TextUtils.join([
			"Wait for open tile ",
			TextUtils.movementType(c.w),
			" ",
			TextUtils.xy(c),
			c.h || c.flags ? ", Ignore " : "",
			c.h ? "Weapons" : "",
			c.h || c.flags ? " " : "",
			c.flags ? TextUtils.waitFlags(c.flags) : "",
		]);
	},
	countArrayEntries(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			"Count array entries ",
			`${TextUtils.variable(c.x, context.hold)}[] `,
			`${TextUtils.scriptVarOp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? "" : TextUtils.uintToInt(c.w).toString(),
		]);
	},
	waitForArrayEntry(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			"Wait for array entry ",
			`${TextUtils.variable(c.x, context.hold)}[] `,
			`${TextUtils.scriptVarOp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? "" : TextUtils.uintToInt(c.w).toString(),
		]);
	},
	waitForVar(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			"Wait until var ",
			`"${TextUtils.variable(c.x, context.hold)}" `,
			`${TextUtils.scriptVarComp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? "" : TextUtils.uintToInt(c.w).toString(),
		]);
	},
	music(c: ScriptCommand) {
		return c.label.newValue.length > 0
			? `0,${c.y},${c.label.newValue}`
			: `${TextUtils.xy(c)}`;
	},
	uintToInt(value: number) {
		if (value > INT_MAX) {
			return value - UINT_MAX;
		} else {
			return value;
		}
	},
};
