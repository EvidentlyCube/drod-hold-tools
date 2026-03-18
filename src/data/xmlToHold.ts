import { Constants } from "../Constants";
import { assertNotNull } from "../utils/Asserts";
import { diffXml, DiffXmlError } from "../utils/DiffXml";
import { SignalUpdatableValue } from "../utils/SignalUpdatableValue";
import { EntranceShowDescription } from "./DrodEnums";
import { holdToXml } from "./HoldToXml";
import { regenerateHoldCharacterUses, regenerateHoldDataUses, regenerateHoldSpeechLocations, regenerateHoldVariableUses, scanHoldForIssues } from "./HoldUtils";
import { HoldVersion } from "./HoldVersion";
import { wcharBase64ToString } from "./Utils";
import { applyHoldChanges } from "./applyHoldChanges";
import { Hold } from "./datatypes/Hold";
import { HoldChange } from "./datatypes/HoldChange";
import { HoldCharacter } from "./datatypes/HoldCharacter";
import { HoldData } from "./datatypes/HoldData";
import { HoldDemo } from "./datatypes/HoldDemo";
import { HoldEntrance } from "./datatypes/HoldEntrance";
import { HoldLevel } from "./datatypes/HoldLevel";
import { HoldMonster } from "./datatypes/HoldMonster";
import { HoldPlayer } from "./datatypes/HoldPlayer";
import { HoldOrb, HoldRoom } from "./datatypes/HoldRoom";
import { HoldSavedGame } from "./datatypes/HoldSavedGame";
import { HoldSpeech } from "./datatypes/HoldSpeech";
import { HoldVariable } from "./datatypes/HoldVariable";
import { HoldWorldMap } from "./datatypes/HoldWorldMap";
import { HoldRefModel } from "./references/HoldReference";

export async function xmlToHold(
	holdReaderId: number,
	originalXml: Document,
	storedChanges: HoldChange[],
	log: (log: string) => void
): Promise<Hold> {
	const drodXml = originalXml.querySelector('drod');
	const holdXml = originalXml.querySelector('Holds');

	assertNotNull(drodXml, "Missing 'drod' node in the hold XML");
	assertNotNull(holdXml, "Missing 'Holds' node in the hold XML");

	log("Parsing Hold");

	const holdVersion = new HoldVersion(intU(drodXml, 'Version'));

	const holdConstructor: ConstructorParameters<typeof Hold>[0] = {
		$holdReaderId: holdReaderId,
		id: int(holdXml, 'HoldID'),
		version: holdVersion,
		gidCreated: int(holdXml, 'GID_Created'),
		gidNewLevelIndex: int(holdXml, 'GID_NewLevelIndex'),
		playerId: int(holdXml, 'GID_PlayerID'),
		editingPrivileges: int(holdXml, 'EditingPrivileges'),
		encDescriptionMessage: str(holdXml, 'DescriptionMessage'),
		encEndHoldMessage: str(holdXml, 'EndHoldMessage'),
		encName: str(holdXml, 'NameMessage'),
		lastUpdated: int(holdXml, 'LastUpdated'),
		lastCharId: intU(holdXml, 'CharID') ?? 0,
		lastScriptId: intU(holdXml, 'ScriptID') ?? 0,
		lastVarId: intU(holdXml, 'VarID') ?? 0,
		startingLevelId: int(holdXml, 'LevelID'),
		status: intU(holdXml, 'Status'),
		lastWorldMapId: intU(holdXml, 'WorldMap') ?? 0
	};

	const hold = new Hold(holdConstructor);

	try {
		await sleep();

		for (const playerXml of originalXml.querySelectorAll('Players')) {
			const id = int(playerXml, 'PlayerID');
			log(`Parsing Players ${id}`);

			const playerData = new HoldPlayer(hold, {
				id,
				encName: str(playerXml, 'NameMessage'),
				encOriginalName: str(playerXml, 'GID_OriginalNameMessage'),
				gidCreated: int(playerXml, 'GID_Created'),
				$isNewlyAdded: false
			});

			hold.players.set(playerData.id, playerData);
			await sleep();
		}

		for (const dataXml of originalXml.querySelectorAll('Data')) {
			const id = int(dataXml, 'DataID');
			log(`Parsing Data ${id}`);

			const holdData = new HoldData(hold, {
				id,
				holdId: int(dataXml, 'HoldID'),
				format: int(dataXml, 'DataFormat'),
				encName: str(dataXml, 'DataNameText'),
				encRawData: strU(dataXml, 'RawData')
			});

			hold.datas.set(holdData.id, holdData);
			await sleep();
		}

		for (const entranceXml of originalXml.querySelectorAll('Entrances')) {
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
				isMainEntrance: bool(entranceXml, 'IsMainEntrance'),
				showDescription: intU(entranceXml, 'ShowDescription') ?? EntranceShowDescription.Always
			});

			hold.entrances.set(entranceData.id, entranceData);
			await sleep();
		}

		for (const varXml of originalXml.querySelectorAll('Vars')) {
			const id = int(varXml, 'VarID');
			log(`Parsing Variable ${id}`);

			const holdVar = new HoldVariable(hold, {
				id,
				encName: str(varXml, 'VarNameText'),
			});

			hold.variables.set(holdVar.id, holdVar);
			await sleep();
		}

		for (const speechXml of originalXml.querySelectorAll('Speech')) {
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

		for (const characterXml of originalXml.querySelectorAll('Characters')) {
			const id = int(characterXml, 'CharID');
			log(`Parsing Character ${id}`);

			const holdCharacter = new HoldCharacter(hold, {
				id,
				animationSpeed: intU(characterXml, 'AnimationSpeed'),
				encName: str(characterXml, 'CharNameText'),
				type: int(characterXml, 'Type'),
				encExtraVars: strU(characterXml, 'ExtraVars'),
				avatarDataId: intU(characterXml, 'DataID'),
				tilesDataId: intU(characterXml, 'DataIDTiles'),
			});

			hold.characters.set(holdCharacter.id, holdCharacter);
			await sleep();
		}

		for (const worldMapXml of originalXml.querySelectorAll('WorldMaps')) {
			const id = int(worldMapXml, 'WorldMap');
			log(`Parsing World Map ${id}`);

			const holdWorldMap = new HoldWorldMap(hold, {
				id,
				dataId: intU(worldMapXml, 'DataID'),
				displayType: int(worldMapXml, 'DisplayType'),
				orderIndex: int(worldMapXml, 'OrderIndex'),
				encName: str(worldMapXml, 'WorldMapNameText'),
			});

			hold.worldMaps.set(holdWorldMap.id, holdWorldMap);
			await sleep();
		}

		for (const levelXml of originalXml.querySelectorAll('Levels')) {
			const id = int(levelXml, 'LevelID');
			log(`Parsing Level ${id}`);

			const holdLevel = new HoldLevel(hold, {
				id,
				holdId: int(levelXml, 'HoldID'),
				created: int(levelXml, 'Created'),
				encName: str(levelXml, 'NameMessage'),
				encDescription: strU(levelXml, 'DescriptionMessage') ?? "",
				gidLevelIndex: int(levelXml, 'GID_LevelIndex'),
				isRequired: boolU(levelXml, 'IsRequired'),
				lastUpdated: int(levelXml, 'LastUpdated'),
				orderIndex: intU(levelXml, 'OrderIndex') ?? -1,
				playerId: int(levelXml, 'PlayerID'),
				entranceDetails: {
					roomId: intU(levelXml, 'RoomID') ?? 0,
					x: intU(levelXml, 'X') ?? 0,
					y: intU(levelXml, 'Y') ?? 0,
					o: intU(levelXml, 'O') ?? 0,
				}
			});

			hold.levels.set(holdLevel.id, holdLevel);
			await sleep();
		}

		for (const roomXml of originalXml.querySelectorAll('Rooms')) {
			const roomId = int(roomXml, 'RoomID');
			log(`Parsing Room ${roomId}`);

			const holdRoom = new HoldRoom(hold, {
				id: roomId,
				levelId: int(roomXml, 'LevelID'),
				dataId: intU(roomXml, 'DataID'),
				overheadDataId: intU(roomXml, 'OverheadDataID'),
				isRequired: int(roomXml, 'IsRequired') === 1,
				isSecret: boolU(roomXml, 'IsSecret'),
				roomX: int(roomXml, 'RoomX'),
				roomY: int(roomXml, 'RoomY'),
				roomCols: int(roomXml, 'RoomCols'),
				roomRows: int(roomXml, 'RoomRows'),
				imageStartX: intU(roomXml, 'ImageStartX'),
				imageStartY: intU(roomXml, 'ImageStartY'),
				overheadImageStartX: intU(roomXml, 'OverheadImageStartX'),
				overheadImageStartY: intU(roomXml, 'OverheadImageStartY'),
				encSquares: str(roomXml, 'Squares'),
				style: intU(roomXml, 'Style'),
				encStyleName: strU(roomXml, 'StyleName'),
				encTileLights: strU(roomXml, 'TileLights'),
				encExtraVars: strU(roomXml, 'ExtraVars'),
			});

			log(`Parsing Room ${roomId} -> Orbs`);
			for (const orbXml of roomXml.querySelectorAll('Orbs')) {
				const orb: HoldOrb = {
					type: intU(orbXml, 'Type'),
					x: int(orbXml, 'X'),
					y: int(orbXml, 'Y'),
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
			let monsterIndex = 0;
			for (const monsterXml of roomXml.querySelectorAll('Monsters')) {
				const holdMonster = new HoldMonster(holdRoom, monsterIndex++, {
					x: int(monsterXml, 'X'),
					y: int(monsterXml, 'Y'),
					o: int(monsterXml, 'O'),
					type: int(monsterXml, 'Type'),
					processSequence: intU(monsterXml, 'ProcessSequence'),
					encExtraVars: strU(monsterXml, 'ExtraVars'),
					isFirstTurn: boolU(monsterXml, 'IsFirstTurn'),
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
				const x = int(scrollXml, 'X');
				const y = int(scrollXml, 'Y');
				holdRoom.scrolls.push({
					id: `${roomId}:scroll:${x}:${y}`,
					$room: holdRoom,
					$scrollRef: { hold, model: HoldRefModel.Scroll, roomId, x, y },
					x,
					y,
					message: new SignalUpdatableValue(wcharBase64ToString(str(scrollXml, 'Message')))
				});

				await sleep();
			}

			log(`Parsing Room ${roomId} -> Exits`);
			for (const exitXml of roomXml.querySelectorAll('Exits')) {
				holdRoom.exits.push({
					entranceId: intU(exitXml, 'EntranceID') ?? 0,
					levelId: intU(exitXml, 'LevelID') ?? 0,
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

		for (const savedGameXml of originalXml.querySelectorAll('SavedGames')) {
			const id = int(savedGameXml, 'SavedGameID');
			log(`Parsing Saved Game ${id}`);

			const holdSavedGame = new HoldSavedGame(hold, {
				id,
				playerId: int(savedGameXml, 'PlayerID'),
				roomId: int(savedGameXml, 'RoomID'),
				type: int(savedGameXml, 'Type'),
				checkpointX: int(savedGameXml, 'CheckpointX'),
				checkpointY: int(savedGameXml, 'CheckpointY'),
				isHidden: bool(savedGameXml, 'IsHidden'),
				lastUpdated: int(savedGameXml, 'LastUpdated'),
				startRoomX: int(savedGameXml, 'StartRoomX'),
				startRoomY: int(savedGameXml, 'StartRoomY'),
				startRoomO: int(savedGameXml, 'StartRoomO'),
				exploredRooms: (strU(savedGameXml, 'ExploredRooms') ?? '')
					.trim()
					.split(" ")
					.filter(Boolean)
					.map(x => parseInt(x)),
				conqueredRooms: (strU(savedGameXml, 'ConqueredRooms') ?? '')
					.trim()
					.split(" ")
					.filter(Boolean)
					.map(x => parseInt(x)),
				created: int(savedGameXml, 'Created'),
				encCommands: str(savedGameXml, 'Commands'),
			});

			hold.savedGames.set(holdSavedGame.id, holdSavedGame);
			await sleep();
		}


		for (const demoXml of originalXml.querySelectorAll('Demos')) {
			const id = int(demoXml, 'DemoID');
			log(`Parsing Saved Game ${id}`);

			const holdDemo = new HoldDemo(hold, {
				id,
				savedGameId: int(demoXml, 'SavedGameID'),
				isHidden: bool(demoXml, 'IsHidden'),
				encDescription: str(demoXml, 'DescriptionMessage'),
				showSequenceNo: int(demoXml, 'ShowSequenceNo'),
				beginTurnNo: int(demoXml, 'BeginTurnNo'),
				endTurnNo: int(demoXml, 'EndTurnNo'),
				nextDemoId: int(demoXml, 'NextDemoID'),
				checksum: int(demoXml, 'Checksum'),
			});

			hold.demos.set(holdDemo.id, holdDemo);
			await sleep();
		}

		/** Init dynamic data */
		loadDynamicData(hold);

		log("Stability check: Exporting XML")
		const exportedXml = await holdToXml(hold);
		log("Stability check: Comparing XMLs")
		try {
			await diffXml(originalXml, exportedXml, (index, total) => {
				const percent = (index / total) * 100;
				log(`Stability check: ${percent.toFixed(2)}% (${index} / ${total})`);
			});

		} catch (e) {
			if (Constants.isDev) {
				(window as any).lastDiffXmlError = e;
				console.error("Diff error details stored in `lastDiffXmlError`")
			}
			throw new Error(
				"Stability check failed. When attempting to export\n"
				+ "the hold without any changes the resulting output was\n"
				+ "different from the provided input.\n"
				+ "It can be that the hold was created with a version of DROD"
				+ " that's earlier than supported by the tool or there is some other"
				+ " issue - feel free to get in touch with me.",
				{ cause: e }
			);
		}

		hold.$changes.loadStored(storedChanges);
		applyHoldChanges(hold);

		loadDynamicData(hold);

		hold.$changeListener.register(hold);

		scanHoldForIssues(hold);
	} catch (e) {
		throw new XmlToHoldError(hold, "XML To Hold failed", { cause: e });
	}

	return hold;
}

function loadDynamicData(hold: Hold) {
	regenerateHoldSpeechLocations(hold);
	regenerateHoldDataUses(hold);

	for (const variableId of hold.variables.keys()) {
		regenerateHoldVariableUses(hold, variableId);
	}
	for (const characterId of hold.characters.keys()) {
		regenerateHoldCharacterUses(hold, characterId);
	}
}

function str(node: Element, attribute: string) {
	const value = node.getAttribute(attribute);

	assertNotNull(value, `Missing attribute ${attribute} in node ${node.tagName}`, node);

	return value;
}

function int(node: Element, attribute: string) {
	const value = node.getAttribute(attribute);

	assertNotNull(value, `Missing attribute ${attribute} in node ${node.tagName}`, node);

	return parseInt(value);
}

function bool(node: Element, attribute: string) {
	const value = node.getAttribute(attribute);

	assertNotNull(value, `Missing attribute ${attribute} in node ${node.tagName}`, node);

	return parseInt(value) === 1;
}

function strU(node: Element, attribute: string) {
	return node.hasAttribute(attribute) ? str(node, attribute) : undefined;
}

function intU(node: Element, attribute: string) {
	return node.hasAttribute(attribute) ? int(node, attribute) : undefined;
}

function boolU(node: Element, attribute: string) {
	return node.hasAttribute(attribute) ? int(node, attribute) === 1 : undefined;
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

export class XmlToHoldError extends Error {
	public readonly hold: Hold;

	public constructor(hold: Hold, message: string, options: ErrorOptions) {
		super(message, options)

		this.hold = hold;
	}

	public get rootError(): Error | undefined {
		let cause = this.cause;
		let loopDepth = 0;
		let lastError: Error | undefined = undefined;

		while (cause) {
			if (loopDepth++ > 1000) {
				break;

			} else if (cause instanceof Error) {
				lastError = cause;
				cause = lastError.cause;

			} else if (typeof cause === 'object' && 'cause' in cause) {
				cause = cause.cause;

			} else {
				break;
			}
		}

		return lastError;
	}

	public get diffXmlErrorCause(): DiffXmlError | undefined {
		let cause = this.cause;
		let loopDepth = 0;

		while (cause) {
			if (loopDepth++ > 1000) {
				break;
			} else if (cause instanceof DiffXmlError) {
				return cause;
			} else if (typeof cause === 'object' && 'cause' in cause) {
				cause = cause.cause;
			} else {
				break;
			}
		}

		return undefined;
	}
}