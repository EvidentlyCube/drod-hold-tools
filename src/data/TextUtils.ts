import { CommandsList } from "./CommandList";
import { Hold } from "./datatypes/Hold";
import { ScriptCommand } from "./datatypes/ScriptCommand";
import { AttackTileType, OrbAgentType, ScriptVarComparators, ScriptVarOperators } from "./DrodEnums";
import { AttackTileTypeToName, CommandInputToName, CueEventTypeToName, GameEffectTypeToName, ImperativeToName, MonsterIdToName, NaturalTargetTypeToName, OrientationToName, PredefinedVariableToName, ScreenFilterToName, StealthTypeToName, TileTypeToName, WaitForFlagToName, WaterTraversalToName, WeaponTypeToName, WorldMapIconToName } from "./DrodEnumToName";

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

	public static tile(id: number): string {
		return TileTypeToName.get(id)
			?? `UnknownTileType_${id}`;
	}

	public static entity(id: number, hold: Hold): string {
		return MonsterIdToName.get(id)
			?? hold.characters.get(id)?.name.newValue
			?? `UnknownEntity_${id}`;
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


	public static imperative(id: number): string {
		return ImperativeToName.get(id)
			?? `UnknownImperative_${id}`;
	}

	public static stripNewline(text: string): string {
		return text.replace(/\n|\r/g, ' ');
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
		return `${command.x},${command.y},${command.x + command.w},${command.y + command.h}`;
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

	public static varSet(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Set var ',
			`"${TextUtils.variable(c.x, context.hold)}" `,
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