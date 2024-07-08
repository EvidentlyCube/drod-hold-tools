import { CommandsList } from "./CommandList";
import { getCommandDataId } from "./CommandUtils";
import { DEFAULT_PROCESSING_SEQUENCE } from "./DrodCommonTypes";
import { XMLWriter } from "./XMLWriter";
import { Hold } from "./datatypes/Hold";
import { HoldCharacter } from "./datatypes/HoldCharacter";
import { HoldData } from "./datatypes/HoldData";
import { HoldEntrance } from "./datatypes/HoldEntrance";
import { HoldLevel } from "./datatypes/HoldLevel";
import { HoldPlayer } from "./datatypes/HoldPlayer";
import { HoldRoom } from "./datatypes/HoldRoom";
import { HoldSpeech } from "./datatypes/HoldSpeech";
import { HoldVariable } from "./datatypes/HoldVariable";
import { HoldWorldMap } from "./datatypes/HoldWorldMap";

interface OutputRefs {
	characterIds: Set<number>;
	dataIds: Set<number>;
	entranceIds: Set<number>;
	levelIds: Set<number>;
	playerIds: Set<number>;
	roomIds: Set<number>;
	speechIds: Set<number>;
	varIds: Set<number>;
	worldMapIds: Set<number>;
}
export async function holdToXml(hold: Hold) {
	const refs: OutputRefs = {
		characterIds: new Set(),
		dataIds: new Set(),
		entranceIds: new Set(),
		levelIds: new Set(),
		playerIds: new Set(),
		roomIds: new Set(),
		speechIds: new Set(),
		varIds: new Set(),
		worldMapIds: new Set(),
	};

	const writer = new XMLWriter();
	writer.write(`<?xml version="1.0" encoding="ISO-8859-1" ?>\n`);

	writer.tag('drod')
		.attr('Version', 508)
		.nest();

	for (const player of hold.players.values()) {
		await writePlayer(writer, refs, player)
	}

	writer.tag('Holds')
		.attr('GID_Created', hold.gidCreated)
		.attr('GID_PlayerID', hold.playerId)
		.attr('LastUpdated', hold.lastUpdated)
		.attr('Status', hold.status)
		.attr('NameMessage', hold.name)
		.attr('DescriptionMessage', hold.descriptionMessage)
		.attr('LevelID', hold.startingLevelId)
		.attr('GID_NewLevelIndex', hold.gidNewLevelIndex)
		.attr('EditingPrivileges', hold.editingPrivileges)
		.attr('EndHoldMessage', hold.endHoldMessage)
		.attr('ScriptID', hold.lastScriptId)
		.attr('VarID', hold.lastVarId)
		.attr('CharID', hold.lastCharId)
		.attr('WorldMap', hold.lastWorldMapId)
		.attr('HoldID', hold.id)
		.nest();

	for (const entrance of hold.entrances.values()) {
		await writeEntrance(writer, refs, entrance)
	}

	for (const variable of hold.variables.values()) {
		await writeVariable(writer, refs, variable)
	}

	for (const character of hold.characters.values()) {
		await writeCharacter(writer, refs, character)
	}

	for (const worldMap of hold.worldMaps.values()) {
		await writeWorldMap(writer, refs, worldMap)
	}

	// @FIXME Export world maps

	writer.end('Holds');

	for (const data of hold.datas.values()) {
		await writeData(writer, refs, data)
	}

	for (const level of hold.levels.values()) {
		await writeLevel(writer, refs, level)
	}

	writer.end('drod');

	return writer.getXml();
}

async function writePlayer(writer: XMLWriter, refs: OutputRefs, player: HoldPlayer) {
	if (refs.playerIds.has(player.id)) {
		return;
	}

	refs.playerIds.add(player.id);

	writer.tag('Players')
		.attr('GID_OriginalNameMessage', player.gidOriginalName)
		.attr('GID_Created', player.gidCreated)
		.attr('LastUpdated', 0)
		.attr('NameMessage', player.name)
		.attr('ForumName', 0)
		.attr('ForumPassword', 0)
		.attr('IsLocal', 0)
		.attr('PlayerID', player.id)
		.end();

	await sleep();
}

async function writeEntrance(writer: XMLWriter, refs: OutputRefs, entrance: HoldEntrance) {
	if (refs.entranceIds.has(entrance.id)) {
		return;
	}

	refs.entranceIds.add(entrance.id);

	if (entrance.dataId) {
		// @FIXME handle null data
		await writeData(writer, refs, entrance.$hold.datas.get(entrance.dataId)!);
	}

	writer.tag('Entrances')
		.attr('EntranceID', entrance.id)
		.attr('DescriptionMessage', entrance.description)
		.attr('RoomID', entrance.roomId)
		.attr('X', entrance.x)
		.attr('Y', entrance.y)
		.attr('O', entrance.o)
		.attr('IsMainEntrance', entrance.isMainEntrance)
		.attr('ShowDescription', entrance.showDescription);

	if (entrance.dataId) {
		writer.attr('DataID', entrance.dataId);
	}
	writer.end();

	await sleep();
}

async function writeData(writer: XMLWriter, refs: OutputRefs, data: HoldData) {
	if (refs.dataIds.has(data.id)) {
		return;
	}

	refs.dataIds.add(data.id);

	writer.tag('Data')
		.attr('DataFormat', data.details.finalValue.format)
		.attr('DataNameText', data.name);

	// TSS hold file has <Data> with no RawData so I guess this is something to support??
	if (data.details.finalValue.rawEncodedData) {
		writer.attr('RawData', data.details.finalValue.format)
	}

	writer
		.attr('HoldID', data.holdId)
		.attr('DataID', data.id)
		.end();

	await sleep();
}

async function writeSpeech(writer: XMLWriter, refs: OutputRefs, speech: HoldSpeech) {
	if (refs.speechIds.has(speech.id)) {
		return;
	}

	refs.speechIds.add(speech.id);

	if (speech.dataId) {
		// @FIXME null data check
		await writeData(writer, refs, speech.$hold.datas.get(speech.dataId)!);
	}

	writer.tag('Speech')
		.attr('Character', speech.character)
		.attr('Mood', speech.mood)
		.attr('Message', speech.message)
		.attr('Delay', speech.delay);

	if (speech.dataId) {
		writer.attr('DataID', speech.dataId);
	}

	writer.attr('SpeechID', speech.id)
		.end();

	await sleep();
}

async function writeVariable(writer: XMLWriter, refs: OutputRefs, variable: HoldVariable) {
	if (refs.varIds.has(variable.id)) {
		return;
	}

	refs.varIds.add(variable.id);

	writer.tag('Vars')
		.attr('VarID', variable.id)
		.attr('VarNameText', variable.name)
		.end();

	await sleep();
}

async function writeWorldMap(writer: XMLWriter, refs: OutputRefs, worldMap: HoldWorldMap) {
	if (refs.worldMapIds.has(worldMap.id)) {
		return;
	}

	if (worldMap.dataId) {
		// @FIXME - Null Data handler
		await writeData(writer, refs, worldMap.$hold.datas.get(worldMap.dataId)!)
	}

	refs.worldMapIds.add(worldMap.id);

	writer.tag('WorldMaps')
		.attr('WorldMap', worldMap.id)
		.attr('DataID', worldMap.dataId ?? 0)
		.attr('DisplayType', worldMap.displayType)
		.attr('OrderIndex', worldMap.orderIndex)
		.attr('WorldMapNameText', worldMap.name)
		.end();

	await sleep();

}

async function writeLevel(writer: XMLWriter, refs: OutputRefs, level: HoldLevel) {
	if (refs.levelIds.has(level.id)) {
		return;
	}

	refs.levelIds.add(level.id);

	writer.tag('Levels')
		.attr('HoldID', level.$hold.id)
		.attr('GID_LevelIndex', level.gidLevelIndex)
		.attr('OrderIndex', level.orderIndex)
		.attr('PlayerID', level.playerId)
		.attr('NameMessage', level.name)
		.attr('Created', level.created)
		.attr('LastUpdated', level.lastUpdated)
		.attr('IsRequired', level.isRequired)
		.attr('LevelID', level.id)
		.end();

	const rooms = level.$hold.rooms.values().filter(room => room.levelId === level.id);

	for (const room of rooms) {
		await writeRoom(writer, refs, room);
	}

	await sleep();
}

async function writeRoom(writer: XMLWriter, refs: OutputRefs, room: HoldRoom) {
	if (refs.roomIds.has(room.id)) {
		return;
	}

	refs.roomIds.add(room.id);

	if (room.dataId) {
		// @FIXME - Null Data handler
		await writeData(writer, refs, room.hold.datas.get(room.dataId)!)
	}

	if (room.overheadDataId) {
		// @FIXME - Null Data handler
		await writeData(writer, refs, room.hold.datas.get(room.overheadDataId)!)
	}

	for (const monster of room.monsters) {
		if (monster.$commandList) {
			await writeCommandData(writer, refs, monster.$commandList);
		}
	}

	writer.tag('Rooms')
		.attr('LevelID', room.levelId)
		.attr('RoomX', room.roomX)
		.attr('RoomY', room.roomY)
		.attr('RoomID', room.id)
		.attr('RoomCols', room.roomCols)
		.attr('RoomRows', room.roomRows)
		.attr('StyleName', room.styleName)
		.attr('IsRequired', room.isRequired)
		.attr('IsSecret', room.isSecret);

	if (room.dataId) {
		writer.attr('DataID', room.dataId)
			.attr('ImageStartX', room.imageStartX ?? 0)
			.attr('ImageStartY', room.imageStartY ?? 0)
	}

	if (room.overheadDataId) {
		writer.attr('OverheadDataID', room.overheadDataId)
			.attr('OverheadImageStartX', room.overheadImageStartX ?? 0)
			.attr('OverheadImageStartY', room.overheadImageStartY ?? 0)
	}

	writer.attr('Squares', { _safeString: room.encSquares })
		.attr('TileLights', { _safeString: room.encTileLights });

	if (room.extraVars) {
		writer.attr('ExtraVars', room.extraVars)
	}
	writer.nest();

	for (const orb of room.orbs) {
		writer.tag('Orbs')
			.attr('Type', orb.type)
			.attr('X', orb.x)
			.attr('Y', orb.y)
			.nest();

		for (const agent of orb.agents) {
			writer.tag('OrbAgents')
				.attr('Type', agent.type)
				.attr('X', agent.x)
				.attr('Y', agent.y)
				.end();
		}

		writer.end('Orbs');
	}

	await sleep();

	for (const monster of room.monsters) {
		writer.tag('Monsters')
			.attr('Type', monster.type)
			.attr('X', monster.x)
			.attr('Y', monster.y)
			.attr('O', monster.o);

		if (monster.processSequence !== DEFAULT_PROCESSING_SEQUENCE) {
			writer.attr('ProcessSequence', monster.processSequence);
		}
		if (monster.extraVars && monster.extraVars.hasAnyVar()) {
			writer.attr('ExtraVars', monster.extraVars);
		}

		if (monster.pieces.length > 0) {
			writer.nest();

			for (const piece of monster.pieces) {
				writer.tag('Pieces')
					.attr('Type', piece.type)
					.attr('X', piece.x)
					.attr('Y', piece.y)
					.end();
			}

			writer.end('Monsters');
		} else {
			writer.end();


			await sleep();
		}
	}

	for (const scroll of room.scrolls) {
		writer.tag('Scrolls')
			.attr('X', scroll.x)
			.attr('Y', scroll.y)
			.attr('Message', scroll.message)
			.end();
	}

	await sleep();

	for (const exit of room.exits) {
		writer.tag('Exits')
			.attr('EntranceID', exit.entranceId)
			.attr('Left', exit.left)
			.attr('Right', exit.right)
			.attr('Top', exit.top)
			.attr('Bottom', exit.bottom)
			.end();
	}

	await sleep();

	for (const checkpoint of room.checkpoints) {
		writer.tag('Checkpoints')
			.attr('X', checkpoint.x)
			.attr('Y', checkpoint.y)
			.end();
	}

	writer.end('Rooms')

	await sleep();
}

async function writeCharacter(writer: XMLWriter, refs: OutputRefs, character: HoldCharacter) {
	if (refs.characterIds.has(character.id)) {
		return;
	}

	refs.characterIds.add(character.id);

	if (character.avatarDataId) {
		// @FIXME handle null data
		await writeData(writer, refs, character.hold.datas.get(character.avatarDataId)!)
	}
	if (character.tilesDataId) {
		// @FIXME handle null data
		await writeData(writer, refs, character.hold.datas.get(character.tilesDataId)!)
	}

	if (character.$commandList) {
		await writeCommandData(writer, refs, character.$commandList);
	}

	writer.tag('Characters')
		.attr('CharID', character.id)
		.attr('CharNameText', character.name)
		.attr('Type', character.type)
		.attr('AnimationSpeed', character.animationSpeed);

	if (character.extraVars) {
		writer.attr('ExtraVars', character.extraVars);
	}

	if (character.avatarDataId) {
		writer.attr('DataID', character.avatarDataId);
	}
	if (character.tilesDataId) {
		writer.attr('DataIDTiles', character.tilesDataId);
	}

	writer.end();

	await sleep();
}

async function writeCommandData(writer: XMLWriter, refs: OutputRefs, commandList: CommandsList) {
	for (const command of commandList.commands) {
		if (command.speechId) {
			// @FIXME null data
			await writeSpeech(writer, refs, commandList.hold.speeches.get(command.speechId)!);
		}

		const dataId = getCommandDataId(command);

		if (dataId) {
			// @FIXME null data
			await writeData(writer, refs, commandList.hold.datas.get(dataId)!);
		}
	}
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