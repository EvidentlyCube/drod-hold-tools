import assert from "node:assert";
import { test } from "node:test";
import {
	ScriptCommandType,
	ScriptVarComparators,
	ScriptVarOperators,
} from "../src/data/DrodEnums";
import type { HoldVariable } from "../src/data/datatypes/HoldVariable";
import { regenerateHoldVariableUses } from "../src/data/HoldUtils";
import { renameVariable } from "../src/data/VariableUtils";
import { TestDataFactory } from "./helpers/TestDataFactory";

interface TestCase {
	name: string;
	reset: () => void;
	validate: () => void;
}
await test("Variable renaming", async () => {
	const TEST_VARIABLE_NAME = "um";

	const hold = TestDataFactory.newHold();
	const level = TestDataFactory.level();
	const room = TestDataFactory.room(level, 50, 50);
	const monsterCharacter = TestDataFactory.monsterCharacter(room, 1, 1);
	const character = TestDataFactory.character("Test");
	const variables: HoldVariable[] = [];

	for (const varName of getAllVariableVariants(TEST_VARIABLE_NAME)) {
		variables.push(TestDataFactory.variable(varName));
	}

	const testCases: TestCase[] = [];

	addCommandCases(
		"Answer Option",
		ScriptCommandType.CC_AnswerOption,
		"speech",
		"expandable-text",
	);
	addCommandCases(
		"Array Var Set",
		ScriptCommandType.CC_ArrayVarSet,
		"label",
		"formula",
	);
	addCommandCases(
		"Array Var Set At",
		ScriptCommandType.CC_ArrayVarSetAt,
		"label",
		"formula",
	);
	addCommandCases(
		"Count Array Entries",
		ScriptCommandType.CC_CountArrayEntries,
		"label",
		"formula",
	);
	addCommandCases(
		"Flashing Text",
		ScriptCommandType.CC_FlashingText,
		"speech",
		"expandable-text",
	);
	addCommandCases(
		"Image Overlay",
		ScriptCommandType.CC_ImageOverlay,
		"label",
		"expandable-text",
	);
	addCommandCases(
		"Question",
		ScriptCommandType.CC_Question,
		"speech",
		"expandable-text",
	);
	addCommandCases(
		"Room Location Text",
		ScriptCommandType.CC_RoomLocationText,
		"speech",
		"expandable-text",
	);
	addCommandCases(
		"Speech",
		ScriptCommandType.CC_Speech,
		"speech",
		"expandable-text",
	);
	addCommandCases(
		"Var Set Append Text",
		ScriptCommandType.CC_VarSet,
		"label",
		"expandable-text",
		{ y: ScriptVarOperators.AppendText },
	);
	addCommandCases(
		"Var Set Assign Text",
		ScriptCommandType.CC_VarSet,
		"label",
		"expandable-text",
		{ y: ScriptVarOperators.AssignText },
	);
	addCommandCases(
		"Var Set =",
		ScriptCommandType.CC_VarSet,
		"label",
		"formula",
		{ y: ScriptVarOperators.Assign },
	);
	addCommandCases(
		"Var Set -",
		ScriptCommandType.CC_VarSet,
		"label",
		"formula",
		{ y: ScriptVarOperators.Dec },
	);
	addCommandCases(
		"Var Set /",
		ScriptCommandType.CC_VarSet,
		"label",
		"formula",
		{ y: ScriptVarOperators.DivideBy },
	);
	addCommandCases(
		"Var Set +",
		ScriptCommandType.CC_VarSet,
		"label",
		"formula",
		{ y: ScriptVarOperators.Inc },
	);
	addCommandCases(
		"Var Set %",
		ScriptCommandType.CC_VarSet,
		"label",
		"formula",
		{ y: ScriptVarOperators.Mod },
	);
	addCommandCases(
		"Var Set *",
		ScriptCommandType.CC_VarSet,
		"label",
		"formula",
		{ y: ScriptVarOperators.MultiplyBy },
	);
	addCommandCases(
		"Var Set At Append Text",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"expandable-text",
		{ h: ScriptVarOperators.AppendText },
	);
	addCommandCases(
		"Var Set At Assign Text",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"expandable-text",
		{ h: ScriptVarOperators.AssignText },
	);
	addCommandCases(
		"Var Set At =",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"formula",
		{ h: ScriptVarOperators.Assign },
	);
	addCommandCases(
		"Var Set At -",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"formula",
		{ h: ScriptVarOperators.Dec },
	);
	addCommandCases(
		"Var Set At /",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"formula",
		{ h: ScriptVarOperators.DivideBy },
	);
	addCommandCases(
		"Var Set At +",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"formula",
		{ h: ScriptVarOperators.Inc },
	);
	addCommandCases(
		"Var Set At %",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"formula",
		{ h: ScriptVarOperators.Mod },
	);
	addCommandCases(
		"Var Set At *",
		ScriptCommandType.CC_VarSetAt,
		"label",
		"formula",
		{ h: ScriptVarOperators.MultiplyBy },
	);
	addCommandCases(
		"Wait For Array Entry",
		ScriptCommandType.CC_WaitForArrayEntry,
		"label",
		"formula",
	);
	addCommandCases(
		"Wait For Expression",
		ScriptCommandType.CC_WaitForExpression,
		"label",
		"formula",
	);
	addCommandCases(
		"Wait For Var Equals Text",
		ScriptCommandType.CC_WaitForVar,
		"label",
		"expandable-text",
		{ y: ScriptVarComparators.EqualsText },
	);
	addCommandCases(
		"Wait For Var =",
		ScriptCommandType.CC_WaitForVar,
		"label",
		"formula",
		{ y: ScriptVarComparators.Equals },
	);
	addCommandCases(
		"Wait For Var >",
		ScriptCommandType.CC_WaitForVar,
		"label",
		"formula",
		{ y: ScriptVarComparators.Greater },
	);
	addCommandCases(
		"Wait For Var >=",
		ScriptCommandType.CC_WaitForVar,
		"label",
		"formula",
		{ y: ScriptVarComparators.GreaterThanOrEqual },
	);
	addCommandCases(
		"Wait For Var <",
		ScriptCommandType.CC_WaitForVar,
		"label",
		"formula",
		{ y: ScriptVarComparators.Less },
	);
	addCommandCases(
		"Wait For Var <=",
		ScriptCommandType.CC_WaitForVar,
		"label",
		"formula",
		{ y: ScriptVarComparators.LessThanOrEqual },
	);
	addCommandCases(
		"Wait For Var !=",
		ScriptCommandType.CC_WaitForVar,
		"label",
		"formula",
		{ y: ScriptVarComparators.Unequal },
	);
	addScrollCases();
	addEntranceCases();
	addEndHoldCase();

	for (const testCase of testCases) {
		testCase.reset();
	}

	for (const variable of variables) {
		await test(`Renaming variable '${variable.name.oldValue}' to '${variable.name.oldValue}new'`, async () => {
			// Reindex all variables
			regenerateHoldVariableUses(hold, variable.id, true);
			variables.forEach(v => void regenerateHoldVariableUses(hold, v.id));

			renameVariable(variable, `${variable.name.oldValue}new`);

			for (const testCase of testCases) {
				await test(`Case ${testCase.name}`, async () => {
					testCase.validate();
				});
			}

			variable.name.unset();
			for (const testCase of testCases) {
				testCase.reset();
			}
		});
	}

	function addCommandCases(
		baseName: string,
		type: ScriptCommandType,
		field: "label" | "speech",
		encoding: "formula" | "expandable-text",
		otherFields: Partial<{
			x: number;
			y: number;
			w: number;
			h: number;
			flags: number;
		}> = {},
	) {
		const variants =
			encoding === "formula"
				? getAllFormulaTextCases()
				: getAllExpandableTextCases();

		for (const variant of variants) {
			const baseBefore = expandCaseToAllVariables(variant[0], encoding);
			const baseAfter = expandCaseToAllVariables(variant[1], encoding);

			const monsterSpeech = TestDataFactory.speech();
			const monsterCommand = TestDataFactory.scriptCommand(monsterCharacter);
			monsterCommand.type = type;
			monsterCommand.x = otherFields?.x ?? 0;
			monsterCommand.y = otherFields?.y ?? 0;
			monsterCommand.w = otherFields?.w ?? 0;
			monsterCommand.h = otherFields?.h ?? 0;
			monsterCommand.flags = otherFields?.flags ?? 0;
			monsterCommand.label.unset();
			monsterCommand.speechId.unset();

			if (field === "speech") {
				monsterCommand.speechId.newValue = monsterSpeech.id;
			}

			const characterSpeech = TestDataFactory.speech();
			const characterCommand = TestDataFactory.scriptCommand(character);
			characterCommand.type = type;
			characterCommand.x = otherFields?.x ?? 0;
			characterCommand.y = otherFields?.y ?? 0;
			characterCommand.w = otherFields?.w ?? 0;
			characterCommand.h = otherFields?.h ?? 0;
			characterCommand.flags = otherFields?.flags ?? 0;
			characterCommand.label.unset();
			characterCommand.speechId.unset();

			if (field === "speech") {
				characterCommand.speechId.newValue = characterSpeech.id;
			}

			testCases.push({
				name: `${baseName}: \`${variant.join("` => `")}\``,
				reset() {
					if (field === "label") {
						monsterCommand.label.newValue = resolveCaseString(baseBefore);
						characterCommand.label.newValue = resolveCaseString(baseBefore);
					} else {
						monsterSpeech.message.newValue = resolveCaseString(baseBefore);
						characterSpeech.message.newValue = resolveCaseString(baseBefore);
					}
				},
				validate() {
					const expected = resolveCaseString(baseAfter);
					if (field === "label") {
						assert.strictEqual(monsterCommand.label.newValue, expected);
						assert.strictEqual(characterCommand.label.newValue, expected);
					} else {
						assert.strictEqual(monsterSpeech.message.newValue, expected);
						assert.strictEqual(characterSpeech.message.newValue, expected);
					}
				},
			});
		}
	}

	function addEntranceCases() {
		for (const variant of getAllExpandableTextCases()) {
			const baseBefore = expandCaseToAllVariables(
				variant[0],
				"expandable-text",
			);
			const baseAfter = expandCaseToAllVariables(variant[1], "expandable-text");

			const entrance = TestDataFactory.entrance(
				room,
				hold.entrances.size % 38,
				(hold.entrances.size / 38) | 0,
			);

			testCases.push({
				name: `Scroll: \`${variant.join("` => `")}\``,
				reset() {
					entrance.description.newValue = resolveCaseString(baseBefore);
				},
				validate() {
					const expected = resolveCaseString(baseAfter);
					assert.strictEqual(entrance.description.newValue, expected);
				},
			});
		}
	}

	function addScrollCases() {
		for (const variant of getAllExpandableTextCases()) {
			const baseBefore = expandCaseToAllVariables(
				variant[0],
				"expandable-text",
			);
			const baseAfter = expandCaseToAllVariables(variant[1], "expandable-text");

			const scroll = TestDataFactory.scroll(
				room,
				room.scrolls.length % 38,
				(room.scrolls.length / 38) | 0,
			);

			testCases.push({
				name: `Scroll: \`${variant.join("` => `")}\``,
				reset() {
					scroll.message.newValue = resolveCaseString(baseBefore);
				},
				validate() {
					const expected = resolveCaseString(baseAfter);
					assert.strictEqual(scroll.message.newValue, expected);
				},
			});
		}
	}

	function addEndHoldCase() {
		const combinedVariantsBefore = getAllExpandableTextCases()
			.map(variant => variant[0])
			.join("");
		const combinedVariantsAfter = getAllExpandableTextCases()
			.map(variant => variant[1])
			.join("");

		const baseBefore = expandCaseToAllVariables(
			combinedVariantsBefore,
			"expandable-text",
		);
		const baseAfter = expandCaseToAllVariables(
			combinedVariantsAfter,
			"expandable-text",
		);

		testCases.push({
			name: `End hold all variants combined`,
			reset() {
				hold.endHoldMessage.newValue = resolveCaseString(baseBefore);
			},
			validate() {
				const expected = resolveCaseString(baseAfter);
				assert.strictEqual(hold.endHoldMessage.newValue, expected);
			},
		});
	}

	function getAllVariableVariants(name: string) {
		const names = [];
		const firstChar = name[0];
		const lastChar = name[name.length - 1];

		for (const type of ["", ".", "@", "#", "_"]) {
			names.push(type + name);
			names.push(type + firstChar + name);
			names.push(type + name + lastChar);
			names.push(type + firstChar + name + lastChar);
		}

		return names;
	}

	function resolveCaseString(caseString: string) {
		for (const variable of variables) {
			caseString = caseString.replace(
				new RegExp(`:P${variable.id}:`, "g"),
				variable.name.oldValue,
			);
			caseString = caseString.replace(
				new RegExp(`:N${variable.id}:`, "g"),
				variable.name.newValue,
			);
		}

		return caseString;
	}

	function expandCaseToAllVariables(
		baseCase: string,
		encoding: "formula" | "expandable-text",
	) {
		const separator = encoding === "formula" ? "+" : "";

		return variables
			.map(v =>
				baseCase.replace(/:P/g, `:P${v.id}:`).replace(/:N/g, `:N${v.id}:`),
			)
			.join(separator);
	}

	function getAllExpandableTextCases() {
		return [
			// Text outside dollar signs is ignored
			["$$:P :P[:P]$$", "$$:P :P[:P]$$"],

			// Text inside is changed
			["$$$:P$$:P$$:P$$$", "$$$:N$$:N$$:N$$$"],

			// Support arrays
			[
				"$$$:P[0]$$:P[1]$$:P[var]$$:P[:P]$$:P[:P[:P]]$$$",
				"$$$:N[0]$$:N[1]$$:N[var]$$:N[:N]$$:N[:N[:N]]$$$",
			],

			// // Support complex formulas
			[
				"$$$:P[:P]+(:P[:P])*(:P[:P[:P]])$$:P[:P]+(:P[:P])*(:P[:P[:P]])$$$",
				"$$$:N[:N]+(:N[:N])*(:N[:N[:N]])$$:N[:N]+(:N[:N])*(:N[:N[:N]])$$$",
			],
		];
	}

	function getAllFormulaTextCases() {
		return [
			// Match single
			[":P", ":N"],
			// More complicated match
			[
				"1+:P-(:P*:P[:P[:P]]/_abs(:P[:P[:P]]))",
				"1+:N-(:N*:N[:N[:N]]/_abs(:N[:N[:N]]))",
			],
		];
	}
});
