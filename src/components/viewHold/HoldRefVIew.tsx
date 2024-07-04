import { getCharacterName, getCommandName } from "../../data/Utils";
import { HoldRef, HoldRefCharacterCommand, HoldRefMonsterCommand } from "../../data/references/HoldReference";

interface Props {
	holdRef?: HoldRef;
}

export default function HoldRefView({ holdRef }: Props) {
	if (!holdRef) {
		return <>
			<i className="fa-icon fa-question icon icon-unknown-ref"></i>
			{" "}<strong>Unknown</strong>
		</>;
	}
	switch (holdRef.model) {
		case "charCommand":
			return <CharacterCommand r={ holdRef } />;

		case "monsterCommand":
			return <MonsterCommand r={ holdRef } />;

		default:
			return <>
				<span className="icon icon-unknown-ref">
					<i className="fas fa-question"></i>
				</span>
				{" "}<strong>Unknown ref</strong>
				{" "}<code>{holdRef.model}</code>
			</>
	}
}

function CharacterCommand({ r }: {r: HoldRefCharacterCommand}) {
	const { hold, characterId, commandIndex } = r;

	const character = hold.characters.getOrError(characterId);
	const command = character.$commandList!.commands[commandIndex];

	return <>
		<span className="icon icon-monster-ref" title="Character">
			<i className="fas fa-user"></i>
		</span>
		{" "}<strong>{getCharacterName(hold, character.type)}</strong>
		{" "}<em>#{commandIndex}::{getCommandName(command.type)}</em>
	</>
}

function MonsterCommand({ r }: {r: HoldRefMonsterCommand}) {
	const { hold, roomId, monsterIndex, commandIndex } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;
	const monster = room.monsters[monsterIndex];
	const command = monster.$commandList!.commands[commandIndex];

	return <>
		<span className="icon icon-monster-ref" title="Monster">
			<i className="fas fa-bug"></i>
		</span>
		{" "}<strong>{level.name.finalText}{": "}{room.$coordsName}</strong>
		{", "}{getCharacterName(hold, monster.$characterTypeId)}
		{" "}({monster.x},{monster.y})
		{" "}<em>#{commandIndex}::{getCommandName(command.type)}</em>

	</>
}