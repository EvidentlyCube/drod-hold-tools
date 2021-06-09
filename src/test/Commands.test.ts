import {TestUtils} from "./TestUtils";
import {CommandsUtils} from "../common/CommandsUtils";
import {Command} from "../data/Command";
import {CharCommand} from "../common/Enums";
import {UINT_MINUS_1} from "../common/CommonTypes";

test('Commands are correctly read', () => {
	const hold = TestUtils.getHoldXml('TestCommandReading');
	const monsters = TestUtils.getAllMonsterCharacters(hold);
	expect(monsters).toHaveLength(1);

	const packedVars = TestUtils.getPackedVars(monsters[0]);
	const commands = CommandsUtils.readCommandsBuffer(packedVars.readByteBuffer('Commands', []));

	expect(commands).toHaveLength(11);
	expectCommand(commands[0], CharCommand.CC_TeleportPlayerTo, 0, 0, 0, 0, 0, 0, '');
	expectCommand(commands[1], CharCommand.CC_TeleportPlayerTo, 1, 1, 0, 0, 0, 0, '');
	expectCommand(commands[2], CharCommand.CC_TeleportPlayerTo, 8, 8, 0, 0, 0, 0, '');
	expectCommand(commands[3], CharCommand.CC_TeleportPlayerTo, 16, 16, 0, 0, 0, 0, '');
	expectCommand(commands[4], CharCommand.CC_TeleportPlayerTo, 31, 31, 0, 0, 0, 0, '');
	expectCommand(commands[5], CharCommand.CC_TeleportPlayerTo, 37, 31, 0, 0, 0, 0, '');
	expectCommand(commands[6], CharCommand.CC_VarSet, UINT_MINUS_1 - 3, 0, 0, 0, 0, 0, '(1234 + 5678)');
	expectCommand(commands[7], CharCommand.CC_Label, 2, 0, 0, 0, 0, 0, '(Test)');
	expectCommand(commands[8], CharCommand.CC_Wait, 256, 0, 0, 0, 0, 0, '');
	expectCommand(commands[9], CharCommand.CC_Wait, 9999, 0, 0, 0, 0, 0, '');
	expectCommand(commands[10], CharCommand.CC_WaitForTurn, 9999, 0, 0, 0, 0, 0, '');
});

test('Packs commands the same way', () => {
	const hold = TestUtils.getHoldXml('TestCommandReading');
	const monsters = TestUtils.getAllMonsterCharacters(hold);
	expect(monsters).toHaveLength(1);

	const packedVars = TestUtils.getPackedVars(monsters[0]);
	const originalBuffer = packedVars.readByteBuffer('Commands', []);
	const commands = CommandsUtils.readCommandsBuffer(originalBuffer);
	const newBuffer = CommandsUtils.writeCommandsBuffer(commands);

	expect(newBuffer).toEqual(originalBuffer);
});

for (const hold of ['TestCommandReading', 'DrodTouch']) {
	describe(`Tests on file: ${hold}.hold`, () => {
		const holdXml = TestUtils.getHoldXml(hold);

		test('Commands are serialized back to the same value', () => {
			const elements = TestUtils.getAllMonsterCharacters(holdXml);

			for (const element of elements) {
				const extraVars = TestUtils.getPackedVars(element);

				const originalBuffer = extraVars.readByteBuffer('Commands', []);
				const commands = CommandsUtils.readCommandsBuffer(originalBuffer);
				const newBuffer = CommandsUtils.writeCommandsBuffer(commands);

				expect(newBuffer).toEqual(originalBuffer);
			}
		});
	});
}


function expectCommand(command: Command, type: CharCommand, x: number, y: number, w: number, h: number, flags: number, speechId: number, label: string) {
	const expectedCommand: Command = {
		command: type,
		changes: {},
		x, y, w, h, flags, speechId, label,
	};
	expect(command).toEqual(expectedCommand);
}