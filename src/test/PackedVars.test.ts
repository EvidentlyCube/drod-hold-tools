import {TestUtils} from "./TestUtils";
import {PackedVarsUtils} from "../common/PackagedVarsUtils";

test('Packed Vars are correctly repacked', () => {
	const hold = TestUtils.getHoldXml('TestCommandReading');
	const monsters = TestUtils.getAllMonsterCharacters(hold);
	expect(monsters).toHaveLength(1);

	const originalBuffer = PackedVarsUtils.base64ToArray(monsters[0]!.getAttribute('ExtraVars')!);
	const packedVars = PackedVarsUtils.readBuffer(originalBuffer);
	const newBuffer = PackedVarsUtils.writeBuffer(packedVars);

	expect(newBuffer).toEqual(Array.from(originalBuffer));
});

for (const hold of ['TestCommandReading', 'DrodTouch']) {
	describe(`Tests on file: ${hold}.hold`, () => {
		const holdXml = TestUtils.getHoldXml(hold);

		test('Commands are serialized back to the same value', () => {
			const elements = TestUtils.getAllMonsterCharacters(holdXml);

			for (const element of elements) {
				const originalBuffer = PackedVarsUtils.base64ToArray(element!.getAttribute('ExtraVars')!);
				const packedVars = PackedVarsUtils.readBuffer(originalBuffer);
				const newBuffer = PackedVarsUtils.writeBuffer(packedVars);

				expect(newBuffer).toEqual(Array.from(originalBuffer));
			}
		});
	});
}