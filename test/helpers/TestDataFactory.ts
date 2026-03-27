import path, { dirname } from "path";
import { VERSION_TSS_509 } from "../../src/Constants";
import { Hold } from "../../src/data/datatypes/Hold"
import { HoldVariable } from "../../src/data/datatypes/HoldVariable";
import { HoldVersion } from "../../src/data/HoldVersion";
import { stringToWCharBase64 } from "../../src/data/Utils";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { readHold } from "../../src/processor/readHold";
import assert from "node:assert";
import { HoldLevel } from "../../src/data/datatypes/HoldLevel";
import { HoldRoom, HoldScroll } from "../../src/data/datatypes/HoldRoom";
import { MonsterType, Mood, Orientation, ScriptCommandType, Speaker } from "../../src/data/DrodEnums";
import { HoldMonster } from "../../src/data/datatypes/HoldMonster";
import { PackedVars } from "../../src/data/PackedVars";
import { writePackedVars } from "../../src/data/PackedVarsUtils";
import { HoldSpeech } from "../../src/data/datatypes/HoldSpeech";
import { ScriptCommand } from "../../src/data/datatypes/ScriptCommand";
import { SignalUpdatableValue } from "../../src/utils/SignalUpdatableValue";
import { HoldEntrance } from "../../src/data/datatypes/HoldEntrance";
import { HoldCharacter } from "../../src/data/datatypes/HoldCharacter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __rootTest = dirname(__dirname);

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

	public static async loadHold(name: string): Promise<Hold> {
		const holdBuffer = await readFile(`${__rootTest}/holds/${name}`);
		const holdBytes = new Uint8Array(holdBuffer);
		const result = await readHold(0, { data: holdBytes });
		assert.ok(result.isSuccess);

		return result.hold;
	}

	public static hold(): Hold {
		return TestDataFactory._lastHold ?? TestDataFactory.newHold();
	}

	public static level(name: string = "Test") {
		const hold = TestDataFactory.hold();

		const existing = hold.levels.find(level => level.name.newValue === name);

		if (existing) {
			return existing;
		}

		const newLevel = new HoldLevel(hold, {
			id: 10000 + hold.levels.size,
			holdId: hold.id,
			playerId: 0,
			gidLevelIndex: hold.levels.size,
			encName: stringToWCharBase64(name),
			orderIndex: hold.levels.size,
			isRequired: false,
			created: Date.now(),
			lastUpdated: Date.now(),
		});

		hold.levels.set(newLevel.id, newLevel);
		return newLevel;
	}

	public static room(level: HoldLevel, x: number, y: number) {
		const hold = TestDataFactory.hold();
		const existing = hold.rooms.find(room => room.levelId === level.id && room.roomX === x && room.roomY === y);

		if (existing) {
			return existing;
		}

		const newRoom = new HoldRoom(hold, {
			id: 10000 + hold.rooms.size,
			levelId: level.id,
			encStyleName: stringToWCharBase64('foundation'),
			roomX: x,
			roomY: y,
			roomCols: 38,
			roomRows: 32,
			encSquares: "",
			encTileLights: "",
			isNestedInLevel: false,
			isRequired: false,
			isSecret: false,
			style: 1,
		});

		hold.rooms.set(newRoom.id, newRoom);
		return newRoom;
	}

	public static monsterCharacter(room: HoldRoom, x: number, y: number): HoldMonster {
		const existing = room.monsters.find(monster => monster.x === x && monster.y === y);

		if (existing) {
			assert.strictEqual(existing.type, MonsterType.Character);
			return existing;
		}

		const packedVars = new PackedVars();
		packedVars.writeByteBuffer('Commands', []);

		const monster = new HoldMonster(room, room.monsters.length, {
			x,
			y,
			o: Orientation.S,
			type: MonsterType.Character,
			processSequence: 1000,
			encExtraVars: writePackedVars(packedVars)
		});

		room.monsters.push(monster);
		return monster;
	}

	public static character(name: string): HoldCharacter {
		const hold = TestDataFactory.hold();
		const existing = hold.characters.find(character => character.name.newValue === name);

		if (existing) {
			return existing;
		}

		const packedVars = new PackedVars();
		packedVars.writeByteBuffer('Commands', []);

		const character = new HoldCharacter(hold, {
			id: 10000 + hold.characters.size,
			encName: stringToWCharBase64(name),
			type: MonsterType.Character,
			encExtraVars: writePackedVars(packedVars),
		});

		hold.characters.set(character.id, character);

		return character;
	}

	public static speech() {
		const hold = TestDataFactory.hold();
		const speech = new HoldSpeech(hold, {
			id: 100000 + hold.speeches.size,
			character: Speaker.Self,
			delay: 0,
			encMessage: '',
			mood: Mood.Normal,
		});

		hold.speeches.set(speech.id, speech);
		return speech;
	}

	public static scriptCommand(monster: HoldMonster | HoldCharacter) {
		assert.strictEqual(monster.type, MonsterType.Character);

		const commands = monster.$commandList?.commands;
		assert.ok(commands);

		const command: ScriptCommand = {
			index: commands.length,
			type: ScriptCommandType.CC_Appear,
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			flags: 0,
			label: new SignalUpdatableValue(''),
			speechId: new SignalUpdatableValue(0),
		};

		(commands as ScriptCommand[]).push(command);

		return command;
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

	public static scroll(room: HoldRoom, x: number, y: number) {
		const existing = room.scrolls.find(scroll => scroll.x === x && scroll.y === y);

		if (existing) {
			return existing;
		}

		const scroll = new HoldScroll(room.$hold, {
			x, y,
			encMessage: '',
			roomId: room.id
		});

		room.scrolls.push(scroll);

		return scroll;
	}

	public static entrance(room: HoldRoom, x: number, y: number) {
		const hold = room.$hold;
		const existing = hold.entrances.find(entrance => entrance.roomId === room.id && entrance.x === x && entrance.y === y);

		if (existing) {
			return existing;
		}

		const entrance = new HoldEntrance(hold, {
			id: 10000 + hold.entrances.size,
			isMainEntrance: false,
			x, y,
			o: Orientation.S,
			roomId: room.id,
			showDescription: 1,
			encDescription: ''
		});

		hold.entrances.set(entrance.id, entrance);

		return entrance;
	}
}