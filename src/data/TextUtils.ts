import { CommandsList } from "./CommandList";
import { Hold } from "./datatypes/Hold";
import { ScriptCommand } from "./datatypes/ScriptCommand";
import { AttackTileType, Mood, OrbAgentType, ScriptVarComparators, ScriptVarOperators } from "./DrodEnums";
import { AttackTileTypeToName, BehaviorToName, CommandInputToName, CueEventTypeToName, GameEffectTypeToName, ImperativeToName, LightColorToName, MonsterIdToName, MoodToName, MovementTypeToName, NaturalTargetTypeToName, OrientationToName, PlayerBehaviorStateToName, PlayerBehaviorToName, PlayerStateToName, PredefinedVariableToName, ScreenFilterToName, StealthTypeToName, TileGroupToName, TileTypeToName, WaitForFlagToName, WaterTraversalToName, WeaponTypeFlagToName, WeaponTypeToName, WorldMapIconToName } from "./DrodEnumToName";

function bitMask(bitField: number, callback: (id: number) => string): string[] {
	const results: string[] = [];
	let bitMask = 1;
	for (let bit = 0; bit < 32; ++bit, bitMask *= 2) {
		if ((bitField & bitMask) == bitMask) {
			results.push(callback(bitMask));
		}
	}

	return results;
}

export class TextUtils {
	public static appearancePlayer(id: number, hold: Hold): string {
		return TextUtils.entity(id, hold);
	}

	public static appearanceMonster(id: number, hold: Hold): string {
		return TextUtils.entity(id, hold);
	}

	public static behavior(id: number): string {
		return BehaviorToName.get(id)
			?? `UnknownBehavior_${id}`;
	}

	public static playerBehavior(id: number): string {
		return PlayerBehaviorToName.get(id)
			?? `UnknownPlayerBehavior_${id}`;
	}

	public static playerBehaviorState(id: number): string {
		return PlayerBehaviorStateToName.get(id)
			?? `UnknownPlayerBehaviorState_${id}`;
	}

	public static playerState(id: number): string {
		return PlayerStateToName.get(id)
			?? `UnknownPlayerState_${id}`;
	}

	public static tile(id: number): string {
		return TileTypeToName.get(id)
			?? `UnknownTileType_${id}`;
	}

	public static tileGroup(id: number): string {
		return TileGroupToName.get(id)
			?? `UnknownTileGroup_${id}`;
	}

	public static entity(id: number, hold: Hold): string {
		return MonsterIdToName.get(id)
			?? hold.characters.get(id)?.name.newValue
			?? `UnknownEntity_${id}`;
	}

	public static entityIdFromName(name: string, hold: Hold): number | undefined {
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
	}

	public static monster(id: number): string {
		return MonsterIdToName.get(id)
			?? `UnknownMonster_${id};`
	}

	public static movementType(id: number): string {
		return MovementTypeToName.get(id)
			?? `UnknownMovementType_${id}`;
	}

	public static displayFilter(id: number): string {
		return ScreenFilterToName.get(id)
			?? `UnknownScreenFilter_${id}`;
	}

	public static dir(id: number): string {
		return OrientationToName.get(id)
			?? `UnknownDirection_${id}`;
	}

	public static effect(id: number): string {
		return GameEffectTypeToName.get(id)
			?? `UnknownGameEffect_${id}`;
	}

	public static wait(id: number): string {
		return WaitForFlagToName.get(id)
			?? `UnknownWaitForTarget_${id}`;
	}

	public static natTarget(id: number): string {
		return NaturalTargetTypeToName.get(id)
			?? `UnknownNaturalTargetType_${id}`;
	}

	public static openClose(id: number): string {
		if (id === OrbAgentType.Open) {
			return "Open";
		} else if (id === OrbAgentType.Close) {
			return "Close";
		} else if (id === OrbAgentType.Toggle) {
			return "toggle";
		} else {
			return `UnknownOpenCloseFlag_${id}`;
		}
	}

	public static stealth(id: number): string {
		return StealthTypeToName.get(id)
			?? `UnknownStealthType_${id}`;
	}

	public static waterTraversal(id: number): string {
		return WaterTraversalToName.get(id)
			?? `UnknownWaterTraversalType_${id}`;
	}

	public static weapon(id: number): string {
		return WeaponTypeToName.get(id)
			?? `UnknownWeaponType_${id}`;
	}

	public static weaponFlag(id: number): string {
		return WeaponTypeFlagToName.get(id)
			?? `UnknownWeaponTypeFlag_${id}`
	}

	public static weaponFlags(bitField: number): string {
		return bitMask(bitField, TextUtils.weaponFlag).join(' ');
	}

	public static event(id: number): string {
		return CueEventTypeToName.get(id)
			?? `UnknownCueEvent_${id}`;
	}

	public static input(id: number): string {
		return CommandInputToName.get(id)
			?? `UnknownCommandInput_${id}`;
	}

	public static worldMapIcon(id: number): string {
		return WorldMapIconToName.get(id)
			?? `UnknownWorldMapIcon_${id}`;
	}

	public static moodName(mood: number): string {
		return MoodToName.get(mood) ?? 'Normal';
	}

	public static moodFromName(moodName: string): number {
		moodName = moodName.toLowerCase().trim();
		for (const [mood, name] of MoodToName.entries()) {
			if (name.toLowerCase().trim() === moodName) {
				return mood;
			}
		}

		return Mood.Normal;
	}


	public static imperative(id: number): string {
		return ImperativeToName.get(id)
			?? `UnknownImperative_${id}`;
	}

	public static stripNewline(text: string): string {
		return text.replace(/\n|\r/g, ' ');
	}

	public static lightColor(id: number): string {
		return LightColorToName.get(id)
			?? `UnknownLightColor_${id}`;
	}

	public static join(items: string[]): string {
		return items.filter(x => x !== null && x !== undefined && x !== '').join("");
	}

	public static waitFlags(id: number): string {
		return bitMask(id, TextUtils.wait).join(" ");
	}

	public static attack(id: AttackTileType): string {
		return AttackTileTypeToName.get(id)
			?? `UnknownAttackTileType_${id}`;
	}

	public static xy(command: ScriptCommand): string {
		return `${command.x},${command.y}`;
	}

	public static wh(command: ScriptCommand): string {
		return `${command.w},${command.h}`;
	}

	public static xywh(command: ScriptCommand): string {
		return `(${command.x},${command.y}),(${command.x + command.w},${command.y + command.h})`;
	}

	public static onOff(value: number): string {
		return value ? 'On' : 'Off';
	}

	public static hex(value: number): string {
		return value.toString(16).padStart(2, '0');
	}

	public static variable(id: number, hold: Hold) {
		return PredefinedVariableToName.get(id)
			?? hold.variables.get(id)?.name.newValue
			?? `UnknownVariable_${id}`;
	}


	public static scriptVarOp(op: ScriptVarOperators): string {
		switch (op) {
			case ScriptVarOperators.Assign: return '=';
			case ScriptVarOperators.Inc: return '+';
			case ScriptVarOperators.Dec: return '-';
			case ScriptVarOperators.AssignText: return ':';
			case ScriptVarOperators.AppendText: return ';';
			case ScriptVarOperators.MultiplyBy: return '*';
			case ScriptVarOperators.DivideBy: return '/';
			case ScriptVarOperators.Mod: return '%';
			default: return '?';
		}
	}

	public static scriptVarComp(comp: ScriptVarComparators): string {
		switch (comp) {
			case ScriptVarComparators.Equals: return '=';
			case ScriptVarComparators.Greater: return '>';
			case ScriptVarComparators.Less: return '<';
			case ScriptVarComparators.EqualsText: return '=';
			case ScriptVarComparators.LessThanOrEqual: return '<=';
			case ScriptVarComparators.GreaterThanOrEqual: return '>=';
			case ScriptVarComparators.Unequal: return '!=';
			default: return '?';
		}
	}

	public static arrayVarSet(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Set array var ',
			TextUtils.variable(c.w, context.hold),
			`[${c.flags}] `,
			`${TextUtils.scriptVarOp(c.h)} `,
			c.label.newValue,
		])
	}

	public static arrayVarSetAt(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Set array var ',
			TextUtils.variable(c.w, context.hold),
			`[${c.flags}] `,
			`at ${TextUtils.xy(c)}`,
			`${TextUtils.scriptVarOp(c.h)} `,
			c.label.newValue,
		])
	}

	public static varSet(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Set var ',
			`"${TextUtils.variable(c.x, context.hold)}" `,
			`${TextUtils.scriptVarOp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? '' : c.w.toString()
		])
	}

	public static varSetAt(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Set var ',
			TextUtils.xy(c),
			` "${TextUtils.variable(c.w, context.hold)}" `,
			`${TextUtils.scriptVarOp(c.h)} `,
			c.label.newValue,
			c.label.newValue ? '' : c.flags.toString()
		])
	}

	public static waitForOpenTile(c: ScriptCommand) {
		return TextUtils.join([
			'Wait for open tile ',
			TextUtils.movementType(c.w),
			' ',
			TextUtils.xy(c),
			c.h || c.flags ? ', Ignore ' : '',
			c.h ? 'Weapons' : '',
			c.h || c.flags ? ' ' : '',
			c.flags ? TextUtils.waitFlags(c.flags) : ''
		])
	}

	public static countArrayEntries(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Count array entries ',
			`${TextUtils.variable(c.x, context.hold)}[] `,
			`${TextUtils.scriptVarOp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? '' : c.w.toString()
		])
	}

	public static waitForArrayEntry(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Wait for array entry ',
			`${TextUtils.variable(c.x, context.hold)}[] `,
			`${TextUtils.scriptVarOp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? '' : c.w.toString()
		])
	}


	public static waitForVar(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Wait until var ',
			`"${TextUtils.variable(c.x, context.hold)}" `,
			`${TextUtils.scriptVarComp(c.y)} `,
			c.label.newValue,
			c.label.newValue ? '' : c.w.toString()
		])
	}

	public static music(c: ScriptCommand) {
		return c.label.newValue.length > 0
			? `0,${c.y},${c.label.newValue}`
			: `${TextUtils.xy(c)}`
	}
}