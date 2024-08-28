import { shouldBeUnreachable } from "../../utils/Interfaces";
import { formatString } from "../../utils/StringUtils";
import { getCharacterName, getCommandName } from "../Utils";
import { Hold } from "../datatypes/Hold";
import { HoldRef, HoldRefCharacterCommand, HoldRefModel, HoldRefMonsterCommand } from "./HoldReference";

let cacheClearTimeout: undefined | number;
const refsCache = new Map<HoldRef, string>();

export function holdRefToSortableString(ref?: HoldRef): string {
	if (!ref) {
		return "";
	}

	const cachedRef = refsCache.get(ref);
	if (cachedRef) {
		return cachedRef;
	}

	if (!cacheClearTimeout) {
		cacheClearTimeout = window.setTimeout(() => {
			refsCache.clear();
			cacheClearTimeout = undefined;
		}, 1000);
	}

	const sortableRef = toSortableString(ref);
	refsCache.set(ref, sortableRef);
	return sortableRef;
}

function toSortableString(ref?: HoldRef): string {
	if (!ref) {
		return "Unknown";
	}

	const model = ref.model;

	switch (model) {
		case HoldRefModel.Character: return getCharacterName(ref.hold, ref.characterId);
		case HoldRefModel.CharacterAvatar: return getCharacterName(ref.hold, ref.characterId) + "::Avatar";
		case HoldRefModel.CharacterTiles: return getCharacterName(ref.hold, ref.characterId) + "::Tiles";
		case HoldRefModel.CharacterCommand: return toSortableCharCommand(ref);
		case HoldRefModel.Data: return ref.hold.datas.getOrError(ref.dataId).name.newValue;
		case HoldRefModel.EntranceVoiceOver: return ref.hold.entrances.getOrError(ref.entranceId).$level.name.newValue;
		case HoldRefModel.MonsterCommand: return toSortableMonsterCommand(ref);
		case HoldRefModel.Room: return toSortableRoomName(ref.hold, ref.roomId);
		case HoldRefModel.RoomImage: return toSortableRoomName(ref.hold, ref.roomId) + "::Image";
		case HoldRefModel.RoomOverheadImage: return toSortableRoomName(ref.hold, ref.roomId) + "::OverheadImage";
		case HoldRefModel.Scroll: return toSortableRoomName(ref.hold, ref.roomId) + `::Scroll(${ref.x},${ref.y})`;
		case HoldRefModel.Hold: return ref.hold.name.newValue;
		case HoldRefModel.Level: return toSortableLevelName(ref.hold, ref.levelId);
		case HoldRefModel.NotApplicable: return "Not Applicable";
		case HoldRefModel.Player: return toSortablePlayerName(ref.hold, ref.playerId);
		case HoldRefModel.Speech: return toSortableSpeech(ref.hold, ref.speechId);
		case HoldRefModel.WorldMap: return "";

		default:
			shouldBeUnreachable(model);
			return 'Unknown model';
	}
}

function toSortableCharCommand(ref: HoldRefCharacterCommand) {
	const { hold, characterId, commandIndex } = ref;
	const command = hold.characters.getOrError(characterId).$commandList!.commands[commandIndex];

	return `${getCharacterName(hold, characterId)} #${commandIndex}::${getCommandName(command.type)}`
}

function toSortableLevelName(hold: Hold, leveLid: number) {
	const level = hold.levels.getOrError(leveLid);

	return level.name.newValue;
}

function toSortablePlayerName(hold: Hold, playerId: number) {
	const player = hold.players.getOrError(playerId);

	return player.name.newValue;
}

function toSortableRoomName(hold: Hold, roomId: number) {
	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return formatString('%: %', level.name.newValue, room.$coordsName);
}

function toSortableSpeech(hold: Hold, speechId: number) {
	const speech = hold.speeches.getOrError(speechId);

	return formatString('Speech: %', toSortableString(speech.$location));
}

function toSortableMonsterCommand(ref: HoldRefMonsterCommand) {
	const { hold, roomId, monsterIndex, commandIndex } = ref;

	const room = hold.rooms.getOrError(roomId);
	const monster = room.monsters[monsterIndex];
	const command = monster.$commandList!.commands[commandIndex];

	return formatString(
		'%, % (%,%) #%::%',
		toSortableRoomName(hold, roomId),
		getCharacterName(hold, monster.$characterTypeId),
		monster.x, monster.y,
		commandIndex,
		getCommandName(command.type)
	);
}