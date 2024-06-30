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

interface OutputRefs {
	playerIds: Set<number>;
	entranceIds: Set<number>;
	dataIds: Set<number>;
	varIds: Set<number>;
	characterIds: Set<number>;
	speechIds: Set<number>;
	levelIds: Set<number>;
	roomIds: Set<number>;
}
export function holdToXml(hold: Hold) {
	const refs: OutputRefs = {
		playerIds: new Set(),
		entranceIds: new Set(),
		dataIds: new Set(),
		varIds: new Set(),
		characterIds: new Set(),
		speechIds: new Set(),
		levelIds: new Set(),
		roomIds: new Set(),
	};

	const writer = new XMLWriter();
	writer.write(`<?xml version="1.0" encoding="ISO-8859-1" ?>\n`);

	writer.tag('drod')
		.attr('version', 508)
		.nest();

	for (const player of Object.values(hold.players)) {
		writePlayer(writer, refs, player)
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

	for (const entrance of Object.values(hold.entrances)) {
		writeEntrance(writer, refs, entrance)
	}

	for (const variable of Object.values(hold.variables)) {
		writeVariable(writer, refs, variable)
	}

	for (const character of Object.values(hold.characters)) {
		writeCharacter(writer, refs, character)
	}

	// @FIXME Export world maps

	writer.end('Holds');

	for (const data of Object.values(hold.data)) {
		writeData(writer, refs, data)
	}

	for (const level of Object.values(hold.levels)) {
		writeLevel(writer, refs, level)
	}

	writer.end('drod');

	return writer.getXml();
}

function writePlayer(writer: XMLWriter, refs: OutputRefs, player: HoldPlayer) {
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
}

function writeEntrance(writer: XMLWriter, refs: OutputRefs, entrance: HoldEntrance) {
	if (refs.entranceIds.has(entrance.id)) {
		return;
	}

	refs.entranceIds.add(entrance.id);

	if (entrance.dataId) {
		// @FIXME handle null data
		writeData(writer, refs, entrance.hold.data[entrance.dataId]);
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
}

function writeData(writer: XMLWriter, refs: OutputRefs, data: HoldData) {
	if (refs.dataIds.has(data.id)) {
		return;
	}

	refs.dataIds.add(data.id);

	writer.tag('Data')
		.attr('DataFormat', data.format)
		.attr('DataNameText', data.name)
		.attr('RawData', data.rawEncodedData)
		.attr('HoldID', data.holdId)
		.attr('DataID', data.id)
		.end();
}

function writeSpeech(writer: XMLWriter, refs: OutputRefs, speech: HoldSpeech) {
	if (refs.speechIds.has(speech.id)) {
		return;
	}

	refs.speechIds.add(speech.id);

	if (speech.dataId) {
		// @FIXME null data check
		writeData(writer, refs, speech.hold.data[speech.dataId]);
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
}

function writeVariable(writer: XMLWriter, refs: OutputRefs, variable: HoldVariable) {
	if (refs.varIds.has(variable.id)) {
		return;
	}

	refs.varIds.add(variable.id);

	writer.tag('Vars')
		.attr('VarID', variable.id)
		.attr('VarNameText', variable.name)
		.end();
}

function writeLevel(writer: XMLWriter, refs: OutputRefs, level: HoldLevel) {
	if (refs.levelIds.has(level.id)) {
		return;
	}

	refs.levelIds.add(level.id);

	writer.tag('Level')
		.attr('HoldID', level.hold.id)
		.attr('GID_LevelIndex', level.gidLevelIndex)
		.attr('OrderIndex', level.orderIndex)
		.attr('PlayerID', level.playerId)
		.attr('NameMessage', level.name)
		.attr('Created', level.created)
		.attr('LastUpdated', level.lastUpdated)
		.attr('IsRequired', level.isRequired)
		.attr('LevelID', level.id)
		.end();

	const rooms = Object.values(level.hold.rooms).filter(room => room.levelId === level.id);

	for (const room of rooms) {
		writeRoom(writer, refs, room);
	}
}

function writeRoom(writer: XMLWriter, refs: OutputRefs, room: HoldRoom) {
	if (refs.roomIds.has(room.id)) {
		return;
	}

	refs.roomIds.add(room.id);

	if (room.dataId) {
		// @FIXME - Null Data handler
		writeData(writer, refs, room.hold.data[room.dataId])
	}

	if (room.overheadDataId) {
		// @FIXME - Null Data handler
		writeData(writer, refs, room.hold.data[room.overheadDataId])
	}

	for (const monster of room.monsters) {
		if (monster.$commandList) {
			writeCommandData(writer, refs, monster.$commandList);
		}
	}

	/*
	<Rooms LevelID='19993' RoomX='49' RoomY='1999347' RoomID='121689' RoomCols='38' RoomRows='32'
		StyleName='' IsRequired='1' IsSecret='0'
		Squares=''
		TileLights=''
		ExtraVars=''>
		*/
	writer.tag('Room')
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

	writer.attr('Squares', room.encSquares)
		.attr('TileLights', room.encTileLights);

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

	for (const monster of room.monsters) {
		writer.tag('Monsters')
			.attr('Type', monster.type)
			.attr('X', monster.x)
			.attr('Y', monster.y)
			.attr('O', monster.y);

		if (monster.processSequence !== DEFAULT_PROCESSING_SEQUENCE) {
			writer.attr('Type', monster.type);
		}
		if (monster.extraVars && monster.extraVars.hasAnyVar()) {
			writer.attr('ExtraVars', monster.extraVars);
		}

		if (monster.pieces.length === 0) {
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
		}
	}

	for (const scroll of room.scrolls) {
		writer.tag('Scrolls')
			.attr('X', scroll.x)
			.attr('Y', scroll.y)
			.attr('Message', scroll.message)
			.end();
	}

	for (const exit of room.exits) {
		writer.tag('Exits')
			.attr('EntranceID', exit.entranceId)
			.attr('Left', exit.left)
			.attr('Right', exit.right)
			.attr('Top', exit.top)
			.attr('Bottom', exit.bottom)
			.end();
	}

	for (const checkpoint of room.checkpoints) {
		writer.tag('Checkpoints')
			.attr('X', checkpoint.x)
			.attr('Y', checkpoint.y)
			.end();
	}

	writer.end('Room')
}

function writeCharacter(writer: XMLWriter, refs: OutputRefs, character: HoldCharacter) {
	if (refs.characterIds.has(character.id)) {
		return;
	}

	refs.characterIds.add(character.id);

	if (character.avatarDataId) {
		// @FIXME handle null data
		writeData(writer, refs, character.hold.data[character.avatarDataId])
	}
	if (character.tilesDataId) {
		// @FIXME handle null data
		writeData(writer, refs, character.hold.data[character.tilesDataId])
	}

	if (character.$commandList) {
		writeCommandData(writer, refs, character.$commandList);
	}

	/*
			<Characters CharID='20006'
			CharNameText='' Type='15'
			AnimationSpeed='0'
			ExtraVars=''
			DataIDTiles='49279' />
	*/
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
}

function writeCommandData(writer: XMLWriter, refs: OutputRefs, commandList: CommandsList) {
	for (const command of commandList.commands) {
		if (command.speechId) {
			// @FIXME null data
			writeSpeech(writer, refs, commandList.hold.speeches[command.speechId]);
		}

		const dataId = getCommandDataId(command);

		if (dataId) {
			// @FIXME null data
			writeData(writer, refs, commandList.hold.data[dataId]);
		}
	}
}
