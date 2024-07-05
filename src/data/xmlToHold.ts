import { HoldIndexedStorage } from "../processor/HoldIndexedStorage";
import { assertNotNull } from "../utils/Asserts";
import { SignalUpdatableValue } from "../utils/SignalUpdatableValue";
import { wcharBase64ToString } from "./Utils";
import { applyHoldChanges } from "./applyHoldChanges";
import { Hold } from "./datatypes/Hold";
import { HoldChangeListener } from "./datatypes/HoldChangeListener";
import { HoldCharacter } from "./datatypes/HoldCharacter";
import { HoldData } from "./datatypes/HoldData";
import { HoldEntrance } from "./datatypes/HoldEntrance";
import { HoldLevel } from "./datatypes/HoldLevel";
import { HoldMonster } from "./datatypes/HoldMonster";
import { HoldPlayer } from "./datatypes/HoldPlayer";
import { HoldOrb, HoldRoom } from "./datatypes/HoldRoom";
import { HoldSpeech } from "./datatypes/HoldSpeech";
import { HoldVariable } from "./datatypes/HoldVariable";

export async function xmlToHold(holdReaderId: number, xml: Document, log: (log: string) => void): Promise<Hold> {
	const drodXml = xml.querySelector('drod');
	const holdXml = xml.querySelector('Holds');

	assertNotNull(drodXml, "Missing 'drod' node in the hold XML");
	assertNotNull(holdXml, "Missing 'Holds' node in the hold XML");

	log("Parsing Hold");

	const hold = new Hold({
		$holdReaderId: holdReaderId,
		id: int(holdXml, 'HoldID'),
		version: int(drodXml, 'Version'),
		gidCreated: int(holdXml, 'GID_Created'),
		gidNewLevelIndex: int(holdXml, 'GID_NewLevelIndex'),
		playerId: int(holdXml, 'GID_PlayerID'),
		editingPrivileges: int(holdXml, 'EditingPrivileges'),
		encDescriptionMessage: str(holdXml, 'DescriptionMessage'),
		encEndHoldMessage: str(holdXml, 'EndHoldMessage'),
		encName: str(holdXml, 'NameMessage'),
		lastUpdated: int(holdXml, 'LastUpdated'),
		lastCharId: int(holdXml, 'CharID'),
		lastScriptId: int(holdXml, 'ScriptID'),
		lastVarId: int(holdXml, 'VarID'),
		lastWorldMapId: int(holdXml, 'WorldMap'),
		startingLevelId: int(holdXml, 'LevelID'),
		status: int(holdXml, 'Status')
	});

	await sleep();

	for (const playerXml of xml.querySelectorAll('Players')) {
		const id = int(playerXml, 'PlayerID');
		log(`Parsing Players ${id}`);

		const playerData = new HoldPlayer(hold, {
			id,
			encName: str(playerXml, 'NameMessage'),
			encOriginalName: str(playerXml, 'GID_OriginalNameMessage'),
			gidCreated: int(playerXml, 'GID_Created')
		});

		hold.players.set(playerData.id, playerData);
		await sleep();
	}

	for (const dataXml of xml.querySelectorAll('Data')) {
		const id = int(dataXml, 'DataID');
		log(`Parsing Data ${id}`);

		const holdData = new HoldData(hold, {
			id,
			holdId: int(dataXml, 'HoldID'),
			format: int(dataXml, 'DataFormat'),
			encName: str(dataXml, 'DataNameText'),
			encRawData: str(dataXml, 'RawData')
		});

		hold.datas.set(holdData.id, holdData);
		await sleep();
	}

	for (const entranceXml of xml.querySelectorAll('Entrances')) {
		const id = int(entranceXml, 'EntranceID');

		log(`Parsing Entrance ${id}`);

		const entranceData = new HoldEntrance(hold, {
			id,
			roomId: int(entranceXml, 'RoomID'),
			dataId: intU(entranceXml, 'DataID'),
			encDescription: str(entranceXml, 'DescriptionMessage'),
			x: int(entranceXml, 'X'),
			y: int(entranceXml, 'Y'),
			o: int(entranceXml, 'O'),
			isMainEntrance: int(entranceXml, 'IsMainEntrance') === 1,
			showDescription: int(entranceXml, 'ShowDescription') === 1
		});

		hold.entrances.set(entranceData.id, entranceData);
		await sleep();
	}

	for (const varXml of xml.querySelectorAll('Vars')) {
		const id = int(varXml, 'VarID');
		log(`Parsing Variable ${id}`);

		const holdVar = new HoldVariable(hold, {
			id,
			encName: str(varXml, 'VarNameText'),
		});

		hold.variables.set(holdVar.id, holdVar);
		await sleep();
	}

	for (const speechXml of xml.querySelectorAll('Speech')) {
		const id = int(speechXml, 'SpeechID');
		log(`Parsing Speech ${id}`);

		const holdSpeech = new HoldSpeech(hold, {
			id,
			dataId: intU(speechXml, 'DataID'),
			character: int(speechXml, 'Character'),
			mood: int(speechXml, 'Mood'),
			delay: int(speechXml, 'Delay'),
			encMessage: str(speechXml, 'Message'),
		});

		hold.speeches.set(holdSpeech.id, holdSpeech);
		await sleep();
	}

	for (const characterXml of xml.querySelectorAll('Characters')) {
		const id = int(characterXml, 'CharID');
		log(`Parsing Character ${id}`);

		const holdCharacter = new HoldCharacter(hold, {
			id,
			animationSpeed: int(characterXml, 'AnimationSpeed'),
			encName: str(characterXml, 'CharNameText'),
			type: int(characterXml, 'Type'),
			encExtraVars: strU(characterXml, 'ExtraVars'),
			avatarDataId: intU(characterXml, 'DataID'),
			tilesDataId: intU(characterXml, 'DataIDTiles'),
		});

		hold.characters.set(holdCharacter.id, holdCharacter);
		await sleep();
	}

	for (const levelXml of xml.querySelectorAll('Levels')) {
		const id = int(levelXml, 'LevelID');
		log(`Parsing Level ${id}`);

		const holdLevel = new HoldLevel(hold, {
			id,
			holdId: int(levelXml, 'HoldID'),
			created: int(levelXml, 'Created'),
			encName: str(levelXml, 'NameMessage'),
			gidLevelIndex: int(levelXml, 'GID_LevelIndex'),
			isRequired: int(levelXml, 'IsRequired') === 1,
			lastUpdated: int(levelXml, 'LastUpdated'),
			orderIndex: int(levelXml, 'OrderIndex'),
			playerId: int(levelXml, 'PlayerID'),
		});

		hold.levels.set(holdLevel.id, holdLevel);
		await sleep();
	}

	for (const roomXml of xml.querySelectorAll('Rooms')) {
		const roomId = int(roomXml, 'RoomID');
		log(`Parsing Room ${roomId}`);

		const holdRoom = new HoldRoom(hold, {
			id: roomId,
			levelId: int(roomXml, 'LevelID'),
			dataId: intU(roomXml, 'DataID'),
			overheadDataId: intU(roomXml, 'OverheadDataID'),
			isRequired: int(roomXml, 'IsRequired') === 1,
			isSecret: int(roomXml, 'IsSecret') === 1,
			roomX: int(roomXml, 'RoomX'),
			roomY: int(roomXml, 'RoomY'),
			roomCols: int(roomXml, 'RoomCols'),
			roomRows: int(roomXml, 'RoomRows'),
			imageStartX: intU(roomXml, 'ImageStartX'),
			imageStartY: intU(roomXml, 'ImageStartY'),
			overheadImageStartX: intU(roomXml, 'OverheadImageStartX'),
			overheadImageStartY: intU(roomXml, 'OverheadImageStartY'),
			encSquares: str(roomXml, 'Squares'),
			encStyleName: str(roomXml, 'StyleName'),
			encTileLights: str(roomXml, 'TileLights'),
			encExtraVars: strU(roomXml, 'ExtraVars'),
		});

		log(`Parsing Room ${roomId} -> Orbs`);
		for (const orbXml of roomXml.querySelectorAll('Orbs')) {
			const orb: HoldOrb = {
				x: int(orbXml, 'X'),
				y: int(orbXml, 'Y'),
				type: int(orbXml, 'Type'),
				agents: []
			};

			for (const orbAgentXml of orbXml.querySelectorAll('OrbAgents')) {
				orb.agents.push({
					x: int(orbAgentXml, 'X'),
					y: int(orbAgentXml, 'Y'),
					type: int(orbAgentXml, 'Type')
				});
			}

			holdRoom.orbs.push(orb);

			await sleep();
		}

		log(`Parsing Room ${roomId} -> Monsters`);
		for (const monsterXml of roomXml.querySelectorAll('Monsters')) {
			const holdMonster = new HoldMonster(holdRoom, {
				x: int(monsterXml, 'X'),
				y: int(monsterXml, 'Y'),
				o: int(monsterXml, 'O'),
				type: int(monsterXml, 'Type'),
				processSequence: intU(monsterXml, 'ProcessSequence'),
				encExtraVars: strU(monsterXml, 'ExtraVars')
			});

			for (const pieceXml of monsterXml.querySelectorAll('Pieces')) {
				holdMonster.pieces.push({
					x: int(pieceXml, 'X'),
					y: int(pieceXml, 'Y'),
					type: int(pieceXml, 'Type'),
				});
			}

			holdRoom.monsters.push(holdMonster);
			await sleep();
		}

		log(`Parsing Room ${roomId} -> Scrolls`);
		for (const scrollXml of roomXml.querySelectorAll('Scrolls')) {
			holdRoom.scrolls.push({
				x: int(scrollXml, 'X'),
				y: int(scrollXml, 'Y'),
				message: new SignalUpdatableValue(wcharBase64ToString(str(scrollXml, 'Message')))
			});

			await sleep();
		}

		log(`Parsing Room ${roomId} -> Exits`);
		for (const exitXml of roomXml.querySelectorAll('Exits')) {
			holdRoom.exits.push({
				entranceId: int(exitXml, 'EntranceID'),
				left: int(exitXml, 'Left'),
				right: int(exitXml, 'Right'),
				top: int(exitXml, 'Top'),
				bottom: int(exitXml, 'Bottom'),
			});

			await sleep();
		}

		log(`Parsing Room ${roomId} -> Checkpoints`);
		for (const checkpointXml of roomXml.querySelectorAll('Checkpoints')) {
			holdRoom.checkpoints.push({
				x: int(checkpointXml, 'X'),
				y: int(checkpointXml, 'Y'),
			})
		}


		hold.rooms.set(holdRoom.id, holdRoom);
		await sleep();
	}

	for (const character of hold.characters.values()) {
		if (!character.$commandList) {
			continue;
		}

		const { commands } = character.$commandList;
		for (let commandIndex = 0; commandIndex < commands.length; commandIndex++) {
			const {speechId} = commands[commandIndex];
			if (speechId) {
				hold.speeches.getOrError(speechId).$location = {
					hold,
					model: 'charCommand',
					characterId: character.id,
					commandIndex
				}
			}
		}
	}

	for (const room of hold.rooms.values()) {
		for (let monsterIndex = 0; monsterIndex < room.monsters.length; monsterIndex++) {
			const monster = room.monsters[monsterIndex];
			if (!monster.$commandList) {
				continue;
			}

			const { commands } = monster.$commandList;
			for (let commandIndex = 0; commandIndex < commands.length; commandIndex++) {
				const {speechId} = commands[commandIndex];
				if (speechId) {
					hold.speeches.getOrError(speechId).$location = {
						hold,
						model: 'monsterCommand',
						roomId: room.id,
						monsterIndex,
						commandIndex
					}
				}
			}
		}
	}

	// Wait for store to be ready
	while (HoldIndexedStorage.isInitializing.value) {
		await sleep(true);
	}

	hold.$changes.loadStored(HoldIndexedStorage.getChangesForHold(hold.$holdReaderId));
	applyHoldChanges(hold);

	new HoldChangeListener().register(hold);

	return hold;
}

function str(node: Element, attribute: string) {
	const value = node.getAttribute(attribute);

	assertNotNull(value, `Missing attribute ${attribute} in node ${node.tagName}`);

	return value;
}

function int(node: Element, attribute: string) {
	const value = node.getAttribute(attribute);

	assertNotNull(value, `Missing attribute ${attribute} in node ${node.tagName}`);

	return parseInt(value);
}

function strU(node: Element, attribute: string) {
	return node.hasAttribute(attribute) ? str(node, attribute) : undefined;
}

function intU(node: Element, attribute: string) {
	return node.hasAttribute(attribute) ? int(node, attribute) : undefined;
}

let lastSleep = 0;
async function sleep(forced = false) {
	return new Promise<void>(resolve => {
		if (Date.now() > lastSleep + 16 || forced) {
			setTimeout(() => {
				lastSleep = Date.now();
				resolve();
			}, 100)
		} else {
			resolve();
		}
	})
}