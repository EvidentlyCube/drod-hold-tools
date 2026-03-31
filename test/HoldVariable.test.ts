import assert from "node:assert";
import { test } from "node:test";
import type { HoldVariable } from "../src/data/datatypes/HoldVariable";
import {
	isArrayVariableFirstCharacter,
	replaceVariableNameInFormula,
	replaceVariableNameInText,
} from "../src/data/VariableUtils";
import { TestDataFactory } from "./helpers/TestDataFactory";

await test("HoldVariable", async () => {
	await test("Variable use and replace", async () => {
		const baseTestCases = [
			`~`,
			` ~ `,
			`(~)`,
			`( ~ )`,
			`@arr[~]`,
			`#arr[~]`,
			`_abs(~)`,
			`1+~+1`,
			`1-~-1`,
			`1*~*1`,
			`1/~/1`,
			`1%~%1`,
		];

		function generateAllNameVariations(
			noPrefixName: string,
			...namesToExclude: string[]
		): string[] {
			const names = [];
			const firstChar = noPrefixName[0];
			const lastChar = noPrefixName[noPrefixName.length - 1];

			for (const type of ["", ".", "@", "#", "_"]) {
				names.push(type + noPrefixName);
				names.push(type + firstChar + noPrefixName);
				names.push(type + noPrefixName + lastChar);
				names.push(type + firstChar + noPrefixName + lastChar);
			}

			return names.filter(name => !namesToExclude.includes(name));
		}

		function generateTestCases(variableNameBefore: string) {
			return baseTestCases.map(testCase =>
				testCase.replace("~", variableNameBefore),
			);
		}

		const runBigTest = async (
			noPrefixName: string,
			variableType: string,
			noPrefixNewName: string,
		) => {
			const suffix = isArrayVariableFirstCharacter(variableType) ? "[0]" : "";
			const name = variableType + noPrefixName;
			const newName = variableType + noPrefixNewName;

			const positiveTestCase = [
				...generateTestCases(name),
				...(suffix ? generateTestCases(name + suffix) : []),
			];
			const renamedTestCase = [
				...generateTestCases(newName),
				...(suffix ? generateTestCases(newName + suffix) : []),
			];

			const negativeTestCases: string[] = [];
			for (const badName of generateAllNameVariations(
				noPrefixName,
				name,
				name + suffix,
			)) {
				negativeTestCases.push(...generateTestCases(badName));
				if (suffix) {
					negativeTestCases.push(...generateTestCases(badName + suffix));
				}
			}

			TestDataFactory.newHold();
			const variable = TestDataFactory.variable(variableType + noPrefixName);

			await test(`Variable ${variable.name.newValue} is used in formula/text`, async () => {
				for (const testCase of positiveTestCase) {
					await test(`Positive: '${testCase}'`, async () => {
						assert.strictEqual(true, variable.isUsedInFormula(testCase));
						assert.strictEqual(true, variable.isUsedInText(`$${testCase}$`));
						assert.strictEqual(
							true,
							variable.isUsedInText(`$$ $${testCase}$ $$`),
						);
						assert.strictEqual(
							true,
							variable.isUsedInText(`$$ $_MyX$ $_MyX * ${testCase} + _MyY$ $$`),
						);
					});
				}

				for (const testCase of negativeTestCases) {
					await test(`Negative: '${testCase}'`, async () => {
						assert.strictEqual(false, variable.isUsedInFormula(testCase));
						assert.strictEqual(false, variable.isUsedInText(`$${testCase}$`));
						assert.strictEqual(
							false,
							variable.isUsedInText(`$$ $${testCase}$ $$`),
						);
						assert.strictEqual(
							false,
							variable.isUsedInText(`$$ $_MyX$ $_MyX * ${testCase} + _MyY$ $$`),
						);
					});
				}
			});
			await test(`Variable ${variable.name.newValue} renamed to ${newName}`, async () => {
				for (let i = 0; i < positiveTestCase.length; i++) {
					const before = positiveTestCase[i];
					const after = renamedTestCase[i];

					await test(`In formulas: '${before}' to '${after}`, async () => {
						assert.strictEqual(
							after,
							replaceVariableNameInFormula(before, name, newName),
						);
					});

					await test(`In texts: '${before}' to '${after}`, async () => {
						assert.strictEqual(
							replaceVariableNameInText(`$${before}$`, name, newName),
							`$${after}$`,
						);
						assert.strictEqual(
							replaceVariableNameInText(
								`$$ $${before}+${before}$ $$`,
								name,
								newName,
							),
							`$$ $${after}+${after}$ $$`,
						);
						assert.strictEqual(
							replaceVariableNameInText(
								`$$ ${before} $${before}$ $$`,
								name,
								newName,
							),
							`$$ ${before} $${after}$ $$`,
						);
						assert.strictEqual(
							replaceVariableNameInText(
								`$$ $_MyX$ $_MyX * ${before} + _MyY$ $$`,
								name,
								newName,
							),
							`$$ $_MyX$ $_MyX * ${after} + _MyY$ $$`,
						);
					});

					await test(`In texts: Keep '${before}' when expression not between dollar signs`, async () => {
						assert.strictEqual(
							replaceVariableNameInText(before, name, newName),
							before,
						);
						assert.strictEqual(
							replaceVariableNameInText(
								`some text ${before} some text`,
								name,
								newName,
							),
							`some text ${before} some text`,
						);
						assert.strictEqual(
							replaceVariableNameInText(`$$${before}$$`, name, newName),
							`$$${before}$$`,
						);
						assert.strictEqual(
							replaceVariableNameInText(`$$ ${before} $$`, name, newName),
							`$$ ${before} $$`,
						);
					});
				}

				for (const testCase of negativeTestCases) {
					await test(`No change: '${testCase}'`, async () => {
						assert.strictEqual(
							replaceVariableNameInFormula(testCase, name, newName),
							testCase,
						);
						assert.strictEqual(
							replaceVariableNameInText(`$${testCase}$`, name, newName),
							`$${testCase}$`,
						);
						assert.strictEqual(
							replaceVariableNameInText(`$$ $${testCase}$ $$`, name, newName),
							`$$ $${testCase}$ $$`,
						);
						assert.strictEqual(
							replaceVariableNameInText(
								`$$ $_MyX$ $_MyX * ${testCase} + _MyY$ $$`,
								name,
								newName,
							),
							`$$ $_MyX$ $_MyX * ${testCase} + _MyY$ $$`,
						);
					});
				}
			});
		};

		await runBigTest("um", "", "mu");
		await runBigTest("um", ".", "mu");
		await runBigTest("um", "#", "mu");
		await runBigTest("um", "@", "mu");

		await test(`Rename correctly handles all other variants of similar variable`, async () => {
			const names = ["um", "uum", "umm", "uumm"];
			const prefixes = ["", ".", "@", "#", "_"];

			TestDataFactory.newHold();
			const variables: HoldVariable[] = [];
			for (const prefix of prefixes) {
				for (const name of names) {
					variables.push(TestDataFactory.variable(prefix + name));
				}
			}

			const getCase = (
				changedVariable: HoldVariable,
				newName: string,
				wrapCharacter: string,
			) =>
				variables
					.map(v => (v === changedVariable ? newName : v.name.newValue))
					.map(v => wrapCharacter + v + wrapCharacter)
					.join(" ");

			for (const variable of variables) {
				const name = variable.name.newValue;
				const newName = `${name}AFTER`;
				const beforeExpression = getCase(variable, name, "");
				const beforeText = getCase(variable, name, "$");
				const afterExpression = getCase(variable, newName, "");
				const afterText = getCase(variable, newName, "$");

				assert.strictEqual(
					replaceVariableNameInFormula(beforeExpression, name, newName),
					afterExpression,
				);
				assert.strictEqual(
					replaceVariableNameInText(beforeText, name, newName),
					afterText,
				);
			}
		});
	});
});
