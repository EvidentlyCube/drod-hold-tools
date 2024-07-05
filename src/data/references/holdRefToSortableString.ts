import { formatString } from "../../utils/StringUtils";
import { getCharacterName, getCommandName } from "../Utils";
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

function toSortableString(ref: HoldRef) {
	switch (ref.model) {
		case "charCommand":
			return toSortableCharCommand(ref);

		case "monsterCommand":
			return toSortableMonsterCommand(ref);

		default:
			return 'Unknown model';
	}
}

function toSortableCharCommand(ref: HoldRefCharacterCommand) {
	const { hold, characterId, commandIndex } = ref;
	const character = hold.characters.getOrError(characterId);
	const command = character.$commandList!.commands[commandIndex];

	return `${getCharacterName(hold, character.type)} #${commandIndex}::${getCommandName(command.type)}`
}

function toSortableMonsterCommand(ref: HoldRefMonsterCommand) {
	const { hold, roomId, monsterIndex, commandIndex } = ref;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;
	const monster = room.monsters[monsterIndex];
	const command = monster.$commandList!.commands[commandIndex];

	return formatString(
		'%: %, % (%,%) #%::%',
		level.name.finalValue,
		room.$coordsName,
		getCharacterName(hold, monster.$characterTypeId),
		monster.x, monster.y,
		commandIndex,
		getCommandName(command.type)
	);
}