import {TestUtils} from "./TestUtils";
import {XmlDecode} from "../common/XmlDecode";

for (const holdName of ['TestCommandReading', 'DrodTouch']) {
	test(`Xml decode of: ${holdName}.hold`, () => {
		const nativeHoldXml = TestUtils.getHoldXml(holdName);
		const holdString = TestUtils.getHoldString(holdName);
		const decode = new XmlDecode();
		decode.write(holdString);

		const serializer = new XMLSerializer();

		const nativeString = serializer.serializeToString(nativeHoldXml).replace(/\r/g, '');
		const customString = serializer.serializeToString(decode.xml).replace(/\r/g, '');

		expect(customString).toEqual(nativeString);
	});
}