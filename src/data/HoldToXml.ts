import { tryToYieldToUi } from "../utils/AsyncUtils";
import type { CommandsList } from "./CommandList";
import { getCommandDataId } from "./CommandUtils";
import { DEFAULT_PROCESSING_SEQUENCE } from "./DrodCommonTypes";
import type { Hold } from "./datatypes/Hold";
import type { HoldCharacter } from "./datatypes/HoldCharacter";
import type { HoldData } from "./datatypes/HoldData";
import type { HoldDemo } from "./datatypes/HoldDemo";
import type { HoldEntrance } from "./datatypes/HoldEntrance";
import type { HoldLevel } from "./datatypes/HoldLevel";
import type { HoldPlayer } from "./datatypes/HoldPlayer";
import type { HoldRoom } from "./datatypes/HoldRoom";
import type { HoldSavedGame } from "./datatypes/HoldSavedGame";
import type { HoldSpeech } from "./datatypes/HoldSpeech";
import type { HoldVariable } from "./datatypes/HoldVariable";
import type { HoldWorldMap } from "./datatypes/HoldWorldMap";
import type { HoldVersion } from "./HoldVersion";
import { stringToWCharBase64 } from "./Utils";
import { XMLWriter } from "./XMLWriter";

interface OutputRefs {
	characterIds: Set<number>;
	dataIds: Set<number>;
	demoIds: Set<number>;
	entranceIds: Set<number>;
	levelIds: Set<number>;
	playerIds: Set<number>;
	roomIds: Set<number>;
	savedGameIds: Set<number>;
	speechIds: Set<number>;
	varIds: Set<number>;
	worldMapIds: Set<number>;
}
interface HoldToXmlOptions {
	updateHoldDate?: boolean;
}
export async function holdToXml(
	hold: Hold,
	options: Partial<HoldToXmlOptions> = {},
): Promise<string> {
	const finalOptions: HoldToXmlOptions = {
		updateHoldDate: options.updateHoldDate ?? false,
	};

	const refs: OutputRefs = {
		characterIds: new Set(),
		dataIds: new Set(),
		demoIds: new Set(),
		entranceIds: new Set(),
		levelIds: new Set(),
		playerIds: new Set(),
		roomIds: new Set(),
		savedGameIds: new Set(),
		speechIds: new Set(),
		varIds: new Set(),
		worldMapIds: new Set(),
	};

	const version = hold.version;
	// In 100 and 201 Hold tag contained everything, later it was changed
	const writer = new XMLWriter();
	writer.write(`<?xml version="1.0" encoding="ISO-8859-1" ?>\n`);

	writer
		.tag("drod")
		.attrIf("Version", version.version, version.isVersionPrinted)
		.attrIf("Info", { _safeString: hold.encDrodInfo }, !!hold.encDrodInfo)
		.nest();

	await writePlayer(
		writer,
		refs,
		hold.players.getOrError(hold.playerId.newValue),
		version,
	);

	writer
		.tag("Holds")
		.attr("GID_Created", hold.gidCreated)
		.attr("GID_PlayerID", hold.playerId.newValue)
		.attr(
			"LastUpdated",
			finalOptions.updateHoldDate ? (Date.now() / 1000) | 0 : hold.lastUpdated,
		)
		.attrU("Status", hold.status)
		.attr("NameMessage", hold.name)
		.attr("DescriptionMessage", hold.descriptionMessage)
		.attr("LevelID", hold.startingLevelId)
		.attr("GID_NewLevelIndex", hold.gidNewLevelIndex)
		.attr("EditingPrivileges", hold.editingPrivileges)
		.attrIf("EndHoldMessage", hold.endHoldMessage, hold.$hasEndHoldMessage)
		.attrIf("ScriptID", hold.lastScriptId, version.hasScripting)
		.attrIf("VarID", hold.lastVarId, version.holdAttr_varId)
		.attrIf("CharID", hold.lastCharId, version.holdAttr_charId)
		.attrIf("WorldMap", hold.lastWorldMapId, version.hasWorldMaps)
		.attr("HoldID", hold.id)
		.nest();

	for (const entrance of hold.entrances.values()) {
		await writeEntrance(writer, refs, entrance, version);
	}

	for (const variable of hold.variables.values()) {
		await writeVariable(writer, refs, variable);
	}

	for (const character of hold.characters.values()) {
		await writeCharacter(writer, refs, character, version);
	}

	for (const worldMap of hold.worldMaps.values()) {
		await writeWorldMap(writer, refs, worldMap, version);
	}

	if (!version.holdNestsEverything) {
		writer.end("Holds");
	}

	if (hold.$isDataFrontLoaded) {
		for (const data of hold.datas.values()) {
			if (data.$isDeleted.newValue === false) {
				await writeData(writer, refs, data, version);
			}
		}
	}

	for (const level of hold.levels.values()) {
		await writeLevel(writer, refs, level, version);
	}

	for (const demo of hold.demos.values()) {
		await writeDemo(writer, refs, demo, version);
	}

	// Print any remaining data that wasn't yet included
	for (const data of hold.datas.values()) {
		if (data.$isDeleted.newValue === false) {
			await writeData(writer, refs, data, version);
		}
	}

	if (version.holdNestsEverything) {
		writer.end("Holds");
	}

	writer.end("drod");

	return writer.getXml();
}

async function writePlayer(
	writer: XMLWriter,
	refs: OutputRefs,
	player: HoldPlayer,
	holdVersion: HoldVersion,
) {
	if (refs.playerIds.has(player.id)) {
		return;
	}

	const { $isModified } = player;
	const originalName = $isModified
		? player.name
		: { _safeString: stringToWCharBase64(player.gidOriginalName) };
	const gidCreated = $isModified ? (Date.now() / 1000) | 0 : player.gidCreated;

	refs.playerIds.add(player.id);

	writer
		.tag("Players")
		.attr("GID_OriginalNameMessage", originalName)
		.attr("GID_Created", gidCreated)
		.attr("LastUpdated", 0)
		.attr("NameMessage", player.name)
		.attrIf(
			"EMailMessage",
			{ _safeString: player.encEmailMessage ?? "" },
			player.encEmailMessage !== undefined,
		)
		.attrIf("ForumName", 0, holdVersion.playerAttr_forumName)
		.attrIf("ForumPassword", 0, holdVersion.playerAttr_forumPassword)
		.attr("IsLocal", 0)
		.attr("PlayerID", player.id)
		.end();

	await tryToYieldToUi();
}

async function writeEntrance(
	writer: XMLWriter,
	refs: OutputRefs,
	entrance: HoldEntrance,
	holdVersion: HoldVersion,
) {
	if (refs.entranceIds.has(entrance.id)) {
		return;
	}

	refs.entranceIds.add(entrance.id);

	if (holdVersion.entrance.isStoredInLevelAttributes) {
		return;
	}

	if (entrance.dataId.newValue) {
		await writeData(
			writer,
			refs,
			entrance.$hold.datas.get(entrance.dataId.newValue),
			holdVersion,
		);
	}

	writer
		.tag("Entrances")
		.attr("EntranceID", entrance.id)
		.attr("DescriptionMessage", entrance.description)
		.attr("RoomID", entrance.roomId)
		.attr("X", entrance.x)
		.attr("Y", entrance.y)
		.attr("O", entrance.o)
		.attr("IsMainEntrance", entrance.isMainEntrance)
		.attrIf(
			"ShowDescription",
			entrance.showDescription.newValue,
			holdVersion.entranceAttr_ShowDescription,
		);

	if (entrance.dataId.newValue) {
		writer.attr("DataID", entrance.dataId.newValue);
	}
	writer.end();

	await tryToYieldToUi();
}

async function writeData(
	writer: XMLWriter,
	refs: OutputRefs,
	data: HoldData | undefined,
	// biome-ignore lint: Keep it for consistency
	holdVersion: HoldVersion,
) {
	if (!data || refs.dataIds.has(data.id)) {
		return;
	}

	refs.dataIds.add(data.id);

	writer
		.tag("Data")
		.attr("DataFormat", data.details.newValue.format)
		.attr("DataNameText", data.name)

		// TSS hold file has <Data> with no RawData so I guess this is something to support??
		.attrIf(
			"RawData",
			{ _safeString: data.details.newValue.rawEncodedData },
			!!data.details.newValue.rawEncodedData,
		)
		.attrIf("HoldID", data.holdId, !!data.holdId)
		.attr("DataID", data.id)
		.end();

	await tryToYieldToUi();
}

async function writeSpeech(
	writer: XMLWriter,
	refs: OutputRefs,
	speech: HoldSpeech | undefined,
	holdVersion: HoldVersion,
) {
	if (speech === undefined || refs.speechIds.has(speech.id)) {
		return;
	}

	refs.speechIds.add(speech.id);

	if (speech.dataId.newValue) {
		await writeData(
			writer,
			refs,
			speech.$hold.datas.get(speech.dataId.newValue),
			holdVersion,
		);
	}

	writer
		.tag("Speech")
		.attr("Character", speech.character)
		.attr("Mood", speech.mood.newValue)
		.attr("Message", speech.message)
		.attr("Delay", speech.delay)
		.attrIf(
			"DataID",
			speech.dataId.newValue ?? 0,
			!!speech.dataId.newValue || holdVersion.speechAttr_alwaysDataId,
		)
		.attr("SpeechID", speech.id)
		.end();

	await tryToYieldToUi();
}

async function writeVariable(
	writer: XMLWriter,
	refs: OutputRefs,
	variable: HoldVariable,
) {
	if (refs.varIds.has(variable.id)) {
		return;
	}

	refs.varIds.add(variable.id);

	writer
		.tag("Vars")
		.attr("VarID", variable.id)
		.attr("VarNameText", variable.name)
		.end();

	await tryToYieldToUi();
}

async function writeWorldMap(
	writer: XMLWriter,
	refs: OutputRefs,
	worldMap: HoldWorldMap,
	holdVersion: HoldVersion,
) {
	if (refs.worldMapIds.has(worldMap.id)) {
		return;
	}

	if (worldMap.dataId.newValue) {
		await writeData(
			writer,
			refs,
			worldMap.$hold.datas.get(worldMap.dataId.newValue),
			holdVersion,
		);
	}

	refs.worldMapIds.add(worldMap.id);

	writer
		.tag("WorldMaps")
		.attr("WorldMap", worldMap.id)
		.attr("DataID", worldMap.dataId.newValue ?? 0)
		.attr("DisplayType", worldMap.displayType)
		.attr("OrderIndex", worldMap.orderIndex)
		.attr("WorldMapNameText", worldMap.name)
		.end();

	await tryToYieldToUi();
}

async function writeLevel(
	writer: XMLWriter,
	refs: OutputRefs,
	level: HoldLevel,
	holdVersion: HoldVersion,
) {
	if (refs.levelIds.has(level.id)) {
		return;
	}

	refs.levelIds.add(level.id);

	await writePlayer(
		writer,
		refs,
		level.$hold.players.getOrError(level.playerId.newValue),
		holdVersion,
	);

	writer
		.tag("Levels")
		.attr("HoldID", level.$hold.id)
		.attr("GID_LevelIndex", level.gidLevelIndex)
		.attrIf("OrderIndex", level.orderIndex, holdVersion.levelsHaveOrderIndex)
		.attr("PlayerID", level.playerId.newValue)
		.attr("NameMessage", level.name);

	if (holdVersion.entrance.isStoredInLevelAttributes) {
		const entrance = level.$hold.entrances.getOrError(level.id);
		writer
			.attr("DescriptionMessage", entrance.description)
			.attr("RoomID", entrance.roomId)
			.attr("X", entrance.x)
			.attr("Y", entrance.y)
			.attr("O", entrance.o);
	}

	writer
		.attr("Created", (level.createdTimestamp.newValue / 1000) | 0)
		.attr("LastUpdated", level.lastUpdated)
		.attrU("IsRequired", level.isRequired)
		.attr("LevelID", level.id);

	const rooms = level.$hold.rooms
		.values()
		.filter(room => room.levelId === level.id);
	const nestedRooms = rooms.filter(room => room.isNestedInLevel);
	const notNestedRooms = rooms.filter(room => !room.isNestedInLevel);

	if (nestedRooms.length === 0) {
		writer.end();
	} else {
		writer.nest();

		for (const room of nestedRooms) {
			await writeRoom(writer, refs, room, holdVersion);
		}

		writer.end("Levels");
	}

	for (const room of notNestedRooms) {
		await writeRoom(writer, refs, room, holdVersion);
	}

	await tryToYieldToUi();
}

async function writeRoom(
	writer: XMLWriter,
	refs: OutputRefs,
	room: HoldRoom,
	holdVersion: HoldVersion,
) {
	if (refs.roomIds.has(room.id)) {
		return;
	}

	refs.roomIds.add(room.id);

	if (room.dataId) {
		await writeData(
			writer,
			refs,
			room.$hold.datas.get(room.dataId),
			holdVersion,
		);
	}

	if (room.overheadDataId) {
		await writeData(
			writer,
			refs,
			room.$hold.datas.get(room.overheadDataId),
			holdVersion,
		);
	}

	if (holdVersion.exportSpeechesBeforeRoom) {
		for (const speech of room.$speeches) {
			await writeSpeech(writer, refs, speech, holdVersion);
		}
	}

	for (const monster of room.monsters) {
		if (monster.$commandList) {
			await writeCommandDataAndSpeech(
				writer,
				refs,
				monster.$commandList,
				holdVersion,
			);
		}
	}

	writer
		.tag("Rooms")
		.attr("LevelID", room.levelId)
		.attr("RoomX", room.roomX)
		.attr("RoomY", room.roomY)
		.attr("RoomID", room.id)
		.attr("RoomCols", room.roomCols)
		.attr("RoomRows", room.roomRows)
		.attrIf("Style", room.style, room.style !== -1)
		.attrIf("StyleName", room.styleName, room.style === -1)
		.attr("IsRequired", room.isRequired)
		.attrU("IsSecret", room.isSecret);

	if (room.dataId) {
		writer
			.attr("DataID", room.dataId)
			.attr("ImageStartX", room.imageStartX ?? 0)
			.attr("ImageStartY", room.imageStartY ?? 0);
	}

	if (room.overheadDataId) {
		writer
			.attr("OverheadDataID", room.overheadDataId)
			.attr("OverheadImageStartX", room.overheadImageStartX ?? 0)
			.attr("OverheadImageStartY", room.overheadImageStartY ?? 0);
	}

	writer
		.attr("Squares", { _safeString: room.encSquares })
		.attrIf(
			"TileLights",
			{ _safeString: room.encTileLights },
			room.encTileLights !== "-1",
		);

	if (room.extraVars) {
		writer.attr("ExtraVars", room.extraVars);
	}
	writer.nest();

	for (const orb of room.orbs) {
		writer
			.tag("Orbs")
			.attrU("Type", orb.type)
			.attr("X", orb.x)
			.attr("Y", orb.y)
			.nest();

		for (const agent of orb.agents) {
			writer
				.tag("OrbAgents")
				.attr("Type", agent.type)
				.attr("X", agent.x)
				.attr("Y", agent.y)
				.end();
		}

		writer.end("Orbs");
	}

	await tryToYieldToUi();

	for (const monster of room.monsters) {
		writer
			.tag("Monsters")
			.attr("Type", monster.type)
			.attr("X", monster.x)
			.attr("Y", monster.y)
			.attr("O", monster.o);

		if (monster.isFirstTurn !== undefined) {
			writer.attr("IsFirstTurn", monster.isFirstTurn);
		}

		if (monster.processSequence !== DEFAULT_PROCESSING_SEQUENCE) {
			writer.attr("ProcessSequence", monster.processSequence);
		}
		if (monster.extraVars?.hasAnyVar()) {
			monster.repackCommandsIntoExtraVars();
			writer.attr("ExtraVars", monster.extraVars);
		}
		if (monster.pieces.length > 0) {
			writer.nest();

			for (const piece of monster.pieces) {
				writer
					.tag("Pieces")
					.attr("Type", piece.type)
					.attr("X", piece.x)
					.attr("Y", piece.y)
					.end();
			}

			writer.end("Monsters");
		} else {
			writer.end();

			await tryToYieldToUi();
		}
	}

	for (const scroll of room.scrolls) {
		writer
			.tag("Scrolls")
			.attr("X", scroll.x)
			.attr("Y", scroll.y)
			.attr("Message", scroll.message)
			.end();
	}

	await tryToYieldToUi();

	for (const exit of room.exits) {
		writer
			.tag("Exits")
			.attrIf(
				"EntranceID",
				exit.entranceId,
				!holdVersion.entrance.isStoredInLevelAttributes,
			)
			.attrIf(
				"LevelID",
				exit.levelId,
				holdVersion.entrance.isStoredInLevelAttributes,
			)
			.attr("Left", exit.left)
			.attr("Right", exit.right)
			.attr("Top", exit.top)
			.attr("Bottom", exit.bottom)
			.end();
	}

	await tryToYieldToUi();

	for (const checkpoint of room.checkpoints) {
		writer
			.tag("Checkpoints")
			.attr("X", checkpoint.x)
			.attr("Y", checkpoint.y)
			.end();
	}

	writer.end("Rooms");

	await tryToYieldToUi();
}

async function writeCharacter(
	writer: XMLWriter,
	refs: OutputRefs,
	character: HoldCharacter,
	holdVersion: HoldVersion,
) {
	if (refs.characterIds.has(character.id)) {
		return;
	}

	refs.characterIds.add(character.id);

	if (character.avatarDataId.newValue) {
		await writeData(
			writer,
			refs,
			character.$hold.datas.get(character.avatarDataId.newValue),
			holdVersion,
		);
	}
	if (character.tilesDataId.newValue) {
		await writeData(
			writer,
			refs,
			character.$hold.datas.get(character.tilesDataId.newValue),
			holdVersion,
		);
	}

	if (character.$commandList) {
		await writeCommandDataAndSpeech(
			writer,
			refs,
			character.$commandList,
			holdVersion,
		);
	}

	writer
		.tag("Characters")
		.attr("CharID", character.id)
		.attr("CharNameText", character.name)
		.attr("Type", character.type);

	if (character.animationSpeed !== undefined) {
		writer.attr("AnimationSpeed", character.animationSpeed);
	}

	if (character.extraVars) {
		character.repackCommandsIntoExtraVars();
		writer.attr("ExtraVars", character.extraVars);
	}

	if (character.avatarDataId.newValue) {
		writer.attr("DataID", character.avatarDataId.newValue);
	}

	if (character.tilesDataId.newValue) {
		writer.attr("DataIDTiles", character.tilesDataId.newValue);
	}

	writer.end();

	await tryToYieldToUi();
}

async function writeCommandDataAndSpeech(
	writer: XMLWriter,
	refs: OutputRefs,
	commandList: CommandsList,
	holdVersion: HoldVersion,
) {
	for (const command of commandList.commands) {
		if (command.speechId.newValue) {
			const speech = commandList.hold.speeches.get(command.speechId.newValue);

			if (speech?.$isDeleted.newValue) {
				commandList.wasModified = true;
				command.speechId.newValue = 0;
			} else {
				await writeSpeech(writer, refs, speech, holdVersion);
			}
		}

		const dataId = getCommandDataId(command);

		if (dataId && commandList.hold.datas.has(dataId)) {
			await writeData(
				writer,
				refs,
				commandList.hold.datas.getOrError(dataId),
				holdVersion,
			);
		}
	}
}

async function writeSavedGame(
	writer: XMLWriter,
	refs: OutputRefs,
	savedGame: HoldSavedGame,
	holdVersion: HoldVersion,
) {
	if (refs.savedGameIds.has(savedGame.id)) {
		return;
	}

	const player = savedGame.$hold.players.get(savedGame.playerId);
	if (player) {
		await writePlayer(writer, refs, player, holdVersion);
	}

	refs.savedGameIds.add(savedGame.id);

	writer
		.tag("SavedGames")
		.attr("PlayerID", savedGame.playerId)
		.attr("RoomID", savedGame.roomId)
		.attrIf("WorldMap", savedGame.worldMap, savedGame.worldMap !== -1)
		.attr("Type", savedGame.type)
		.attrIf("SavedGameID", savedGame.id, holdVersion.saveAttr_idEarly)
		.attr("CheckpointX", savedGame.checkpointX)
		.attr("CheckpointY", savedGame.checkpointY)
		.attr("IsHidden", savedGame.isHidden)
		.attr("LastUpdated", savedGame.lastUpdated)
		.attr("StartRoomX", savedGame.startRoomX)
		.attr("StartRoomY", savedGame.startRoomY)
		.attr("StartRoomO", savedGame.startRoomO)
		.attrIf(
			"StartRoomAppearance",
			savedGame.startRoomAppearance,
			savedGame.startRoomAppearance !== -1,
		)
		.attrIf(
			"StartRoomSwordOff",
			savedGame.startRoomSwordOff,
			savedGame.startRoomSwordOff !== -1,
		)
		.attrIf(
			"StartRoomWaterTraversal",
			savedGame.startRoomWaterTraversal,
			savedGame.startRoomWaterTraversal !== -1,
		)
		.attrIf(
			"StartRoomWeaponType",
			savedGame.startRoomWeaponType,
			savedGame.startRoomWeaponType !== -1,
		)
		.attrIf("SavedGameID", savedGame.id, !holdVersion.saveAttr_idEarly)
		.attrIf(
			"ExploredRooms",
			{ _safeString: `${savedGame.exploredRooms.join(" ")} ` },
			savedGame.exploredRooms.length > 0,
		)
		.attrIf(
			"ConqueredRooms",
			{ _safeString: `${savedGame.conqueredRooms.join(" ")} ` },
			savedGame.conqueredRooms.length > 0,
		)
		.attrIf(
			"CompletedScripts",
			{ _safeString: `${savedGame.completedScripts.join(" ")} ` },
			savedGame.completedScripts.length > 0,
		)
		.attrIf(
			"GlobalScripts",
			{ _safeString: `${savedGame.globalScripts.join(" ")} ` },
			savedGame.globalScripts.length > 0,
		)
		.attr("Created", savedGame.created)
		.attr("Commands", { _safeString: savedGame.encCommands })
		.attrIf(
			"EntrancesExplored",
			{ _safeString: `${savedGame.entrancesExplored.join(" ")} ` },
			savedGame.entrancesExplored.length > 0,
		)
		.attrIf("LevelDeaths", savedGame.levelDeaths, savedGame.levelDeaths !== -1)
		.attrIf("LevelKills", savedGame.levelKills, savedGame.levelKills !== -1)
		.attrIf("LevelMoves", savedGame.levelMoves, savedGame.levelMoves !== -1)
		.attrIf("LevelTime", savedGame.levelTime, savedGame.levelTime !== -1)
		.attrIf("Stats", { _safeString: savedGame.encStats }, !!savedGame.encStats)
		.attrIf("Version", savedGame.version, savedGame.version !== -1);

	if (savedGame.worldMapIcons.length > 0) {
		writer.nest();

		for (const icon of savedGame.worldMapIcons) {
			writer
				.tag("WorldMapIcons")
				.attr("WorldMap", icon.worldMap)
				.attr("EntranceID", icon.entranceId)
				.attr("X", icon.x)
				.attr("Y", icon.y)
				.attrIf("ImageID", icon.imageId, icon.imageId !== -1)
				.attrIf("CharID", icon.charId, icon.charId !== -1)
				.attr("Flags", icon.flags)
				.end();
		}

		writer.end("SavedGames");
	} else {
		writer.end();
	}

	await tryToYieldToUi();
}

async function writeDemo(
	writer: XMLWriter,
	refs: OutputRefs,
	demo: HoldDemo,
	holdVersion: HoldVersion,
) {
	if (refs.demoIds.has(demo.id)) {
		return;
	}

	refs.demoIds.add(demo.id);

	const nextDemo = demo.$hold.demos.get(demo.nextDemoId);
	if (nextDemo) {
		await writeDemo(writer, refs, nextDemo, holdVersion);
	}

	const savedGame = demo.$hold.savedGames.get(demo.savedGameId);
	if (savedGame) {
		await writeSavedGame(writer, refs, savedGame, holdVersion);
	}

	writer
		.tag("Demos")
		.attr("SavedGameID", demo.savedGameId)
		.attr("IsHidden", demo.isHidden)
		.attr("DescriptionMessage", {
			_safeString: stringToWCharBase64(demo.description),
		})
		.attr("ShowSequenceNo", demo.showSequenceNo)
		.attr("BeginTurnNo", demo.beginTurnNo)
		.attr("EndTurnNo", demo.endTurnNo)
		.attrIf("NextDemoID", demo.nextDemoId, demo.nextDemoId !== -1)
		.attr("Checksum", demo.checksum)
		.attrIf("Flags", demo.flags, demo.flags !== -1)
		.attr("DemoID", demo.id);

	writer.end();

	await tryToYieldToUi();
}
