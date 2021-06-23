import {Hold} from "../data/Hold";
import {PackedVarsUtils} from "../common/PackagedVarsUtils";
import {CommandsUtils} from "../common/CommandsUtils";
import {UINT_MINUS_1} from "../common/CommonTypes";
import {MonsterUtils} from "../common/MonsterUtils";
import {ModelType} from "../common/Enums";
import {Scroll} from "../data/Scroll";
import {createNullCommand} from "../data/Command";

export function decodeHoldNode(element: Element, hold: Hold) {
	switch (element.nodeName) {
		case 'Players': {
			const playerId = getInt(element, "PlayerID");
			hold.players.set(playerId, {
				xml: element,
				modelType: ModelType.Player,
				id: playerId,
				name: decodeText(element, 'NameMessage'),

				isNew: false,
				isDeleted: false,

				changes: {},
			});
		}
			break;

		case 'Holds':
			hold.xml = element;
			hold.name = decodeText(element, 'NameMessage');
			hold.description = decodeText(element, 'DescriptionMessage');
			hold.ending = decodeText(element, 'EndHoldMessage');
			hold.playerId = getInt(element, 'GID_PlayerID');
			hold.dateCreated = new Date(getInt(element, 'GID_Created') * 1000);
			hold.dateUpdated = new Date(getInt(element, 'LastUpdated') * 1000);
			for (const child of element.children) {
				decodeHoldNode(child, hold);
			}
			break;

		case 'Entrances':
			const entranceId = getInt(element, 'EntranceID');
			hold.entrances.set(entranceId, {
				modelType: ModelType.Entrance,
				xml: element,
				id: entranceId,
				roomId: getInt(element, 'RoomID'),
				description: decodeText(element, 'DescriptionMessage'),
				isMainEntrance: getInt(element, 'IsMainEntrance') === 1,
				showDescription: getInt(element, 'ShowDescription') === 1,
				x: getInt(element, 'X'),
				y: getInt(element, 'Y'),
				dataId: element.hasAttribute('DataID') ? getInt(element, 'DataID') : 0,
				changes: {},
			});
			break;

		case 'Vars':
			const varId = getInt(element, 'VarID');
			hold.vars.set(varId, {
				modelType: ModelType.Var,
				xml: element,
				name: decodeText(element, 'VarNameText'),
			});
			break;

		case 'Characters':
			const characterId = getInt(element, 'CharID');
			const extraVars = PackedVarsUtils.readBuffer(
				PackedVarsUtils.base64ToArray(
					getText(element, 'ExtraVars', true),
				),
			);
			const commands = CommandsUtils.readCommandsBuffer(extraVars.readByteBuffer('Commands', [])!);
			const processingSequence = extraVars.readUint('ProcessSequenceParam', 9999);

			hold.characters.set(characterId, {
				modelType: ModelType.Character,
				xml: element,
				id: characterId,
				name: decodeText(element, 'CharNameText'),
				tilesDataId: element.hasAttribute('DataIDTiles') ? getInt(element, 'DataIDTiles') : 0,
				faceDataId: element.hasAttribute('DataID') ? getInt(element, 'DataID') : 0,
				commands, processingSequence, extraVars,
				changes: {},
			});
			break;

		case 'Data':
			const dataId = getInt(element, 'DataID');
			hold.datas.set(dataId, {
				modelType: ModelType.Data,
				xml: element,
				id: dataId,
				format: getInt(element, 'DataFormat'),
				name: decodeText(element, 'DataNameText'),
				size: Math.ceil((element.getAttribute('RawData') || '').length * 4 / 3),
				links: [],
				changes: {}
			});
			break;

		case 'Speech':
			const speechId = getInt(element, 'SpeechID');

			hold.speeches.set(speechId, {
				modelType: ModelType.Speech,
				id: speechId,
				xml: element,
				text: decodeText(element, 'Message'),
				dataId: element.hasAttribute('DataID') ? getInt(element, 'DataID') : 0,
				moodId: element.hasAttribute('Mood') ? getInt(element, 'Mood') : 0,
				speakerId: element.hasAttribute('Character') ? getInt(element, 'Character') : 0,
				delay: element.hasAttribute('Delay') ? getInt(element, 'Delay') : 0,
				isDeleted: false,
				command: createNullCommand(),
				changes: {},
			});
			break;

		case 'Levels':
			const levelId = getInt(element, 'LevelID');
			hold.levels.set(levelId, {
				modelType: ModelType.Level,
				xml: element,
				id: levelId,
				playerId: getInt(element, 'PlayerID'),
				index: getInt(element, 'OrderIndex'),
				name: decodeText(element, 'NameMessage'),
				dateCreated: new Date(getInt(element, 'Created') * 1000),
				entranceX: 0,
				entranceY: 0,
				entrances: [],
				changes: {},
			});
			break;

		case 'Rooms': {
			const roomId = getInt(element, 'RoomID');
			hold.rooms.set(roomId, {
				modelType: ModelType.Room,
				xml: element,
				roomId: roomId,
				levelId: getInt(element, 'LevelID'),
				roomX: getInt(element, 'RoomX'),
				roomY: getInt(element, 'RoomY'),
				customImageDataId: element.hasAttribute('DataID') ? getInt(element, 'DataID') : 0,
				overheadImageDataId: element.hasAttribute('OverheadDataID') ? getInt(element, 'OverheadDataID') : 0,
				checkpoints: [],
				monsters: [],
				scrolls: [],
				characterCount: 0,
			});
			for (const child of element.children) {
				decodeHoldNode(child, hold);
			}
		}
			break;

		case 'Monsters': {
			const roomId = getInt(element.parentElement!, 'RoomID');
			const room = hold.rooms.get(roomId)!;
			const extraVars = PackedVarsUtils.readBuffer(
				PackedVarsUtils.base64ToArray(
					getText(element, 'ExtraVars', true),
				),
			);

			const commands = CommandsUtils.readCommandsBuffer(extraVars.readByteBuffer("Commands", []));
			const processingSequence = extraVars.readUint('ProcessSequenceParam', 9999);
			const isVisible = extraVars.readBool('visible', false);
			const characterType = MonsterUtils.fixCharacterType(extraVars.readUint('id', UINT_MINUS_1), hold);

			room.monsters.push({
				modelType: ModelType.Monster,
				xml: element,
				roomId: roomId,
				x: getInt(element, 'X'),
				y: getInt(element, 'Y'),
				o: getInt(element, 'O'),
				type: getInt(element, 'Type'),
				extraVars, commands, processingSequence, isVisible, characterType,
			});
		}
			break;

		case 'Checkpoints': {
			const roomId = getInt(element.parentElement!, 'RoomID');
			const room = hold.rooms.get(roomId)!;

			room.checkpoints.push({
				x: getInt(element, 'X'),
				y: getInt(element, 'Y'),
			});
		}
			break;

		case 'Scrolls': {
			const roomId = getInt(element.parentElement!, 'RoomID');
			const room = hold.rooms.get(roomId)!;
			const scrollX = getInt(element, 'X');
			const scrollY = getInt(element, 'Y');
			const scrollId = `${roomId}.${scrollX.toString().padStart(2, '0')}.${scrollY.toString().padStart(2, '0')}`;
			const scroll: Scroll = {
				modelType: ModelType.Scroll,
				xml: element,
				id: scrollId,
				roomId: roomId,
				text: decodeText(element, 'Message'),
				x: scrollX,
				y: scrollY,
				changes: {},
			};

			hold.scrolls.set(scrollId, scroll);
			room.scrolls.push(scroll);
		}
			break;

		case 'WorldMaps': {
			const worldMapId = getInt(element, 'WorldMap');

			hold.worldMaps.set(worldMapId, {
				modelType: ModelType.WorldMap,
				xml: element,
				name: decodeText(element, 'WorldMapNameText'),
			});
		}
			break;

		case 'Orbs':
			// Silently Ignore
			break;

		case 'Exits':
			// Silently Ignore
			break;

		case 'SavedGames':
			// Silently Ignore
			break;

		case 'Demos':
			// Silently Ignore
			break;

		default:
			throw new Error(`Unknown element name ${element.nodeName}`);
	}
}

function getText(element: Element, attribute: string, safe: boolean = false) {
	if (!element.hasAttribute(attribute) && !safe) {
		throw new Error(`Element ${getPathToRoot(element)} does not have the attribute ${attribute}`);
	}

	return element.getAttribute(attribute) || '';
}

function decodeText(element: Element, attribute: string) {
	const text = atob(getText(element, attribute)).replace(/\0/g, '');
	return text.replace(/\r/g, "\n");
}

function getInt(element: Element, attribute: string) {
	const text = getText(element, attribute);
	const res = parseInt(text);

	if (Number.isNaN(res)) {
		throw new Error(`Element ${getPathToRoot(element)} has attribute ${attribute} which was meant to be a number but was ${text} instead`);
	}

	return res;
}

function getPathToRoot(element: Element) {
	const bits = [];

	let checked: Element = element;

	while (checked) {
		const parent = checked.parentElement;
		if (!parent) {
			bits.unshift(checked.nodeName);
			break;
		}

		const position = getParentPosition(checked, parent);
		bits.unshift(`${element.nodeName}[${position}]`);
		checked = parent;
	}

	bits.unshift('ROOT');

	return bits.join('.');
}

function getParentPosition(element: Element, parent: Element) {
	for (let i = 0; i < parent.children.length; i++) {
		if (parent.children.item(i) === element) {
			return i;
		}
	}

	return -1;
}