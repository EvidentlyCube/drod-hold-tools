import {DecodeState, DecodeStep} from "./DecoderCommon";

export const getDecodeValidateXml = (): DecodeStep => {
	return {
		name: 'Validate Xml',
		run(decoder: DecodeState): boolean {
			const {holdXml} = decoder;
			const holdsCount = holdXml.evaluate("count(//Holds)", holdXml).numberValue;
			const levelsCount = holdXml.evaluate("count(//Levels)", holdXml).numberValue;
			const roomsCount = holdXml.evaluate("count(//Rooms)", holdXml).numberValue;
			const entrancesCount = holdXml.evaluate("count(//Entrances)", holdXml).numberValue;

			if (holdsCount === 0) {
				throw new Error("No hold information found in the file - are you sure this is not a player profile?");

			} else if (holdsCount > 1) {
				throw new Error("Multiple holds found in the file, this is unsupported");

			} else if (levelsCount === 0) {
				throw new Error("No hold information found in the file - are you sure this is not a player profile?");

			} else if (roomsCount === 0) {
				throw new Error("No room information found in the file - are you sure this is not a player profile?");

			} else if (entrancesCount === 0) {
				throw new Error("No entrance information found in the file - are you sure this is not a demo?");
			}
			return true;
		},
	};
};