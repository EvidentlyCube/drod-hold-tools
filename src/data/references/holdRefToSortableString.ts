import { formatString } from "../../utils/StringUtils";
import { getCharacterName, getCommandName } from "../Utils";
import { Hold } from "../datatypes/Hold";
import { HoldRef, HoldRefCharacterCommand, HoldRefMonsterCommand } from "./HoldReference";

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

function toSortableString(ref: HoldRef): string {
	switch (ref.model) {
		case "character": return getCharacterName(ref.hold, ref.characterId);
		case "charAvatar": return getCharacterName(ref.hold, ref.characterId) + "::Avatar";
		case "charTiles": return getCharacterName(ref.hold, ref.characterId) + "::Tiles";
		case "charCommand": return toSortableCharCommand(ref);
		case "data": return ref.hold.datas.getOrError(ref.dataId).name.newValue;
		case "entranceVoiceOver": return ref.hold.entrances.getOrError(ref.entranceId).$level.name.newValue;
		case "monsterCommand": return toSortableMonsterCommand(ref);
		case "room": return toSortableRoomName(ref.hold, ref.roomId);
		case "roomImage": return toSortableRoomName(ref.hold, ref.roomId) + "::Image";
		case "roomOverheadImage": return toSortableRoomName(ref.hold, ref.roomId) + "::OverheadImage";
		case "scroll": return toSortableRoomName(ref.hold, ref.roomId) + `::Scroll(${ref.x},${ref.y})`;

		default:
			return 'Unknown model';
	}
}

function toSortableCharCommand(ref: HoldRefCharacterCommand) {
	const { hold, characterId, commandIndex } = ref;
	const command = hold.characters.getOrError(characterId).$commandList!.commands[commandIndex];

	return `${getCharacterName(hold, characterId)} #${commandIndex}::${getCommandName(command.type)}`
}

function toSortableRoomName(hold: Hold, roomId: number) {
	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return formatString('%: %', level.name.newValue, room.$coordsName);
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