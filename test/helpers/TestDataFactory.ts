import { VERSION_TSS_508, VERSION_TSS_509 } from "../../src/Constants";
import { Hold } from "../../src/data/datatypes/Hold"
import { HoldVariable } from "../../src/data/datatypes/HoldVariable";
import { HoldVersion } from "../../src/data/HoldVersion";
import { stringToWCharBase64 } from "../../src/data/Utils";


export class TestDataFactory {
	private static _lastHold?: Hold;

	public static newHold(): Hold {
		TestDataFactory._lastHold = new Hold({
			$holdReaderId: 1,
			$isDataFrontLoaded: true,
			$hasEndHoldMessage: true,
			id: 1,
			version: new HoldVersion(VERSION_TSS_509),
			gidCreated: 0,
			gidNewLevelIndex: 0,
			editingPrivileges: 1,
			playerId: 1,
			lastUpdated: 1,
			status: 1,
			encName: '',
			encDescriptionMessage: '',
			encEndHoldMessage: '',
			encDrodInfo: '',
			lastScriptId: 0,
			lastVarId: 1,
			lastCharId: 0,
			lastWorldMapId: 0,
			startingLevelId: 0,
		});

		return TestDataFactory._lastHold;
	}

	public static hold(): Hold {
		return TestDataFactory._lastHold ?? TestDataFactory.newHold();
	}

	public static variable(name: string) {
		const hold = TestDataFactory.hold()

		const existing = hold.variables.find(variable => variable.name.newValue === name);

		if (existing) {
			return existing;
		}

		const newVariable = new HoldVariable(hold, {
			id: hold.lastVarId + hold.variables.size,
			encName: stringToWCharBase64(name),
		});
		hold.variables.set(newVariable.id, newVariable);

		return newVariable;
	}
}