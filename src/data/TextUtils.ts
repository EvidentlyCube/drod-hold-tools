import { CommandsList } from "./CommandList";
import { ScriptCommand } from "./datatypes/ScriptCommand";
import { AttackTileFlag, ScriptVarComparators, ScriptVarOperators } from "./DrodEnums";

export class TextUtils {
	public static appearancePlayer(id: number): string {
		return `[@TODO:APPEARANCE_PLAYER:${id}]`;
	}

	public static appearanceMonster(id: number): string {
		return `[@TODO:APPEARANCE_MONSTER:${id}]`;
	}

	public static tile(id: number): string {
		return `[@TODO:TILE:${id}]`;
	}

	public static entity(id: number): string {
		return `[@TODO:ENTITY:${id}]`;
	}

	public static displayFilter(id: number): string {
		return `[@TODO:DISPLAY_FILTER:${id}]`;
	}

	public static dir(id: number): string {
		return `[@TODO:DIRECTION:${id}]`;
	}

	public static effect(id: number): string {
		return `[@TODO:EFFECT:${id}]`;
	}

	public static wait(id: number): string {
		return `[@TODO:WAIT_FLAG:${id}]`;
	}

	public static natTarget(id: number): string {
		return `[@TODO:NATURAL_TARGET:${id}]`;
	}

	public static openClose(id: number): string {
		return `[@TODO:OPEN_CLOSE:${id}]`;
	}

	public static stealth(id: number): string {
		return `[@TODO:STEALTH:${id}]`;
	}

	public static waterTraversal(id: number): string {
		return `[@TODO:wATER_TRAVERSAL:${id}]`;
	}

	public static weapon(id: number): string {
		return `[@TODO:WEAPON:${id}]`;
	}

	public static event(id: number): string {
		return `[@TODO:EVENT:${id}]`;
	}

	public static input(id: number): string {
		return `[@TODO:INPUT:${id}]`;
	}

	public static worldMapIcon(id: number): string {
		return `[@TODO:WORLD_MAP_ICON:${id}]`;
	}

	public static worldMapImageFlag(id: number): string {
		return `[@TODO:WORLD_MAP_IMAGE_FLAG:${id}]`;
	}

	public static stripNewline(text: string): string {
		return text.replace(/\n|\r/g, ' ');
	}

	public static join(items: string[]): string {
		return items.filter(x => x !== null && x !== undefined && x !== '').join("");
	}

	public static waitFlags(id: number): string {
		const result: string[] = [];
		let bitMask = 1;
		for (let bit = 0; bit < 32; ++bit, bitMask *= 2) {
			if ((id & bitMask) == bitMask) {
				result.push(TextUtils.wait(bitMask));
			}
		}

		return result.join("");
	}

	public static attack(id: AttackTileFlag): string {
		switch (id) {
			case AttackTileFlag.AT_Stab: return 'Stab';
			case AttackTileFlag.AT_Explode: return 'Explode';
			case AttackTileFlag.AT_Damage: return 'Damage';
			case AttackTileFlag.AT_Kill: return 'Kill';
			default: return '[UNKNOWN]';
		}
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
			case ScriptVarComparators.Inequal: return '!=';
			default: return '?';
		}
	}

	public static varSet(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Set var ',
			`"${context.hold.variables.get(c.x)?.name.newValue ?? '?'}" `,
			`${TextUtils.scriptVarOp(c.y)} `,
			c.label,
			c.label ? '' : c.w.toString()
		])
	}

	public static waitForVar(c: ScriptCommand, context: CommandsList) {
		return TextUtils.join([
			'Wait until var ',
			`"${context.hold.variables.get(c.x)?.name.newValue ?? '?'}" `,
			`${TextUtils.scriptVarComp(c.y)} `,
			c.label,
			c.label ? '' : c.w.toString()
		])
	}

	public static music(c: ScriptCommand) {
		return c.label.length > 0
			? `0,${c.y},${c.label}`
			: `${TextUtils.xy(c)}`
	}
}