import { shouldBeUnreachable } from "../utils/Interfaces";
import { escapeRegex } from "../utils/StringUtils";
import {
	canCommandTypeStoreExpandableTextInLabel,
	canCommandTypeStoreFormulaInLabel,
} from "./CommandUtils";
import type { Hold } from "./datatypes/Hold";
import type { HoldVariable } from "./datatypes/HoldVariable";
import { HoldRefModel, resolveReference } from "./references/HoldReference";

/**
 * @return Returns true if the given string is a single digit.
 */
export function isDigit(char: string): boolean {
	return char.length === 1 && char >= "0" && char <= "9";
}

/**
 * @return Returns true if the given string is a single character a-z either upper or lowercase.
 */
export function isAlphaCharacter(char: string): boolean {
	return (
		char.length === 1
		&& ((char >= "a" && char <= "z") || (char >= "A" && char <= "Z"))
	);
}

export function isValidVariableFirstCharacter(char: string): boolean {
	return (
		isDigit(char)
		|| isAlphaCharacter(char)
		|| char === "."
		|| char === "@"
		|| char === "#"
	);
}

export function isValidVariableSubsequentCharacter(char: string): boolean {
	return (
		isDigit(char) || isAlphaCharacter(char) || char === "_" || char === " "
	);
}

export function isArrayVariableFirstCharacter(char: string): boolean {
	return char === "@" || char === "#";
}

export function isTypedVariableFirstCharacter(char: string) {
	return char === "@" || char === "#" || char === ".";
}

/**
 * Generate a regular expression that matches a given variable name within
 * command formulas.
 */
export function getVariableInFormulaRegexp(
	variableName: string,
	globalFlag: boolean = false,
) {
	return new RegExp(
		`(?<![a-z0-9\\.#@_])${escapeRegex(variableName)}(?![a-z0-9_])`,
		`i${globalFlag ? "g" : ""}`,
	);
}

export function validateVariableRenaming(
	hold: Hold,
	oldName: string,
	newName: string,
): string | false {
	if (newName.length === 0) {
		return "Variable name must be longer than 0 characters.";
	}

	if (isTypedVariableFirstCharacter(oldName[0]) && oldName[0] !== newName[0]) {
		return "Variable type cannot be changed.";
	} else if (!isValidVariableFirstCharacter(newName[0])) {
		return "A variable name must start with a digit or a letter (uppercase or lowercase) or a period.";
	} else {
		for (let i = 1; i < newName.length; i++) {
			if (!isValidVariableSubsequentCharacter(newName[i])) {
				return `Invalid character "${newName[i]}" at position ${i + 1}.`;
			}
		}

		if (newName[newName.length - 1] === " ") {
			return "Variable name must not end with a space.";
		}
	}

	for (const variable of hold.variables.values()) {
		if (variable.name.newValue === newName) {
			return "Variable name already exists.";
		}
	}

	return false;
}

export function renameVariable(
	variable: HoldVariable,
	newName: string,
): boolean {
	const oldName = variable.name.newValue;

	if (validateVariableRenaming(variable.hold, oldName, newName)) {
		return false;
	}

	for (const ref of variable.$uses) {
		switch (ref.model) {
			case HoldRefModel.CharacterCommand: {
				const characterCommand = resolveReference(ref);
				if (canCommandTypeStoreExpandableTextInLabel(characterCommand)) {
					characterCommand.label.newValue = replaceVariableNameInText(
						characterCommand.label.newValue,
						oldName,
						newName,
					);
				} else if (canCommandTypeStoreFormulaInLabel(characterCommand)) {
					characterCommand.label.newValue = replaceVariableNameInFormula(
						characterCommand.label.newValue,
						oldName,
						newName,
					);
				}
				break;
			}

			case HoldRefModel.MonsterCommand: {
				const monsterCommand = resolveReference(ref);
				if (canCommandTypeStoreExpandableTextInLabel(monsterCommand)) {
					monsterCommand.label.newValue = replaceVariableNameInText(
						monsterCommand.label.newValue,
						oldName,
						newName,
					);
				} else if (canCommandTypeStoreFormulaInLabel(monsterCommand)) {
					monsterCommand.label.newValue = replaceVariableNameInFormula(
						monsterCommand.label.newValue,
						oldName,
						newName,
					);
				}
				break;
			}

			case HoldRefModel.Entrance: {
				const entrance = resolveReference(ref);
				entrance.description.newValue = replaceVariableNameInText(
					entrance.description.newValue,
					oldName,
					newName,
				);
				break;
			}

			case HoldRefModel.HoldEndMessage: {
				const hold = resolveReference(ref);
				hold.endHoldMessage.newValue = replaceVariableNameInText(
					hold.endHoldMessage.newValue,
					oldName,
					newName,
				);
				break;
			}

			case HoldRefModel.Scroll: {
				const scroll = resolveReference(ref);
				scroll.message.newValue = replaceVariableNameInText(
					scroll.message.newValue,
					oldName,
					newName,
				);
				break;
			}

			case HoldRefModel.Speech: {
				const speech = resolveReference(ref);
				speech.message.newValue = replaceVariableNameInText(
					speech.message.newValue,
					oldName,
					newName,
				);
				break;
			}

			default:
				shouldBeUnreachable(ref);
				break;
		}
	}

	variable.name.newValue = newName;

	return true;
}

export function isVariableUsedInText(
	text: string,
	variableFormulaRegexp: RegExp,
): boolean {
	const matches = text.matchAll(/\$(.*)\$/g);

	for (const [, match] of matches) {
		if (variableFormulaRegexp.test(match)) {
			return true;
		}
	}

	return false;
}

export function replaceVariableNameInFormula(
	formula: string,
	oldName: string,
	newName: string,
) {
	return formula.replace(getVariableInFormulaRegexp(oldName, true), newName);
}

export function replaceVariableNameInText(
	text: string,
	oldName: string,
	newName: string,
) {
	return text.replace(/\$(.*?)\$/g, (_, match) => {
		return `$${replaceVariableNameInFormula(match, oldName, newName)}$`;
	});
}
