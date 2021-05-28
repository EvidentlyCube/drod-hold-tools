import {Hold} from "../data/Hold";
import {PackedVarsUtils} from "../common/PackagedVarsUtils";
import {CommandsUtils} from "../common/CommandsUtils";
import {UINT_MINUS_1} from "../common/CommonTypes";


export function decodeHoldNode(element: Element, hold: Hold) {
	switch (element.nodeName) {
		case 'Players':
			hold.author = {
				xml: element,
				name: decodeText(element, 'NameMessage'),
			};
			break;

		case 'Holds':
			hold.xmlData = element;
			hold.name = decodeText(element, 'NameMessage');
			hold.description = decodeText(element, 'DescriptionMessage');
			hold.dateCreated = new Date(getInt(element, 'GID_Created') * 1000);
			hold.dateUpdated = new Date(getInt(element, 'LastUpdated') * 1000);
			for (const child of element.children) {
				decodeHoldNode(child, hold);
			}
			break;

		case 'Entrances':
			const entranceId = getInt(element, 'EntranceID');
			hold.entrances.set(entranceId, {
				xml: element,
				description: decodeText(element, 'DescriptionMessage'),
			});
			break;

		case 'Vars':
			const varId = getInt(element, 'VarID');
			hold.vars.set(varId, {
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

			const commands = CommandsUtils.readCommandsBuffer(extraVars.readByteBuffer("Commands", [])!);
			const processingSequence = extraVars.readUint('ProcessSequenceParam', 9999);

			hold.characters.set(characterId, {
				xml: element,
				name: decodeText(element, 'CharNameText'),
				commands, processingSequence
			});
			break;

		case 'Data':
			const dataId = getInt(element, 'DataID');
			hold.datas.set(dataId, {
				xml: element,
				format: getInt(element, 'DataFormat'),
				name: decodeText(element, 'DataNameText'),
			});
			break;

		case 'Speech':
			const speechId = getInt(element, 'SpeechID');
			hold.speeches.set(speechId, {
				id: speechId,
				xml: element,
				text: decodeText(element, 'Message')
			});
			break;

		case 'Levels':
			const levelId = getInt(element, 'LevelID');
			hold.levels.set(levelId, {
				xml: element,
				name: decodeText(element, 'NameMessage'),
			});
			break;

		case 'Rooms': {
			const roomId = getInt(element, 'RoomID');
			hold.rooms.set(roomId, {
				xml: element,
				levelId: getInt(element, 'LevelID'),
				roomX: getInt(element, 'RoomX'),
				roomY: getInt(element, 'RoomY'),
				checkpoints: [],
				monsters: [],
				scrolls: [],
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
			const characterType = extraVars.readUint('id', UINT_MINUS_1);

			room.monsters.push({
				xml: element,
				x: getInt(element, 'X'),
				y: getInt(element, 'Y'),
				o: getInt(element, 'O'),
				type: getInt(element, 'Type'),
				extraVars, commands, processingSequence, isVisible, characterType
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

			room.scrolls.push({
				xml: element,
				text: decodeText(element, 'Message'),
				x: getInt(element, 'X'),
				y: getInt(element, 'Y'),
			});
		}
			break;

		case 'WorldMaps': {
			const worldMapId = getInt(element, 'WorldMap');

			hold.worldMaps.set(worldMapId, {
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
	return atob(getText(element, attribute)).replace(/\0/g, '');
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