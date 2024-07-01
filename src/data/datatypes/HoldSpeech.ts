import { formatString } from "../../utils/StringUtils";
import { getCharacterName, getCommandName, getSpeakerMood } from "../Utils";
import { DrodText } from "./DrodText";
import type { Hold } from "./Hold";

type SpeechLocation = {
	source: 'character';
	characterId: number;
	commandIndex: number;
} | {
	source: 'monster';
	roomId: number;
	monsterIndex: number;
	commandIndex: number;
}

interface SpeechConstructor {
	id: number;
	dataId?: number;
	character: number;
	mood: number;
	delay: number;
	encMessage: string;
}
export class HoldSpeech {
	public readonly $hold: Hold;

	public readonly id: number;
	public readonly dataId?: number;
	public readonly character: number;
	public readonly mood: number;
	public readonly delay: number;
	public readonly message: DrodText;

	public $location?: SpeechLocation;

	public get $speaker(): string {
		return getCharacterName(this.$hold, this.character);
	}

	public get $mood() :string {
		return getSpeakerMood(this.mood);
	}

	public get $locationName(): string {
		const {$hold, $location} = this;
		if (!$location) {
			return "Unknown";

		} else if ($location.source === 'character') {
			const {characterId, commandIndex} = $location;

			const character = $hold.characters.getOrError(characterId);
			const command = character.$commandList!.commands[commandIndex]!;

			return `Character ${character.name.finalText}#${commandIndex}::${getCommandName(command.type)}`;

		} else if ($location.source === 'monster') {
			const {roomId, monsterIndex, commandIndex} = $location;

			const room = $hold.rooms.getOrError(roomId);
			const level = room.$level;
			const monster = room.monsters[monsterIndex];
			const command = monster.$commandList!.commands[commandIndex];

			return formatString(
				"%: %, % (%,%)#%::%",
				level.name.finalText, room.$coordsName,
				getCharacterName(this.$hold, monster.$characterTypeId),
				monster.x, monster.y,
				commandIndex,
				getCommandName(command.type)
			);

		} else {
			return "Unknown";
		}
	}

	public constructor(hold: Hold, opts: SpeechConstructor) {
		this.$hold = hold;

		this.id = opts.id
		this.dataId = opts.dataId
		this.character = opts.character
		this.mood = opts.mood
		this.delay = opts.delay
		this.message = new DrodText(opts.encMessage);
	}
}