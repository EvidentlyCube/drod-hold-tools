import { getCharacterName, getCommandName } from "../../data/Utils";
import { HoldRef, HoldRefCharacterAvatar, HoldRefCharacterCommand, HoldRefCharacterTiles, HoldRefMonsterCommand, HoldRefRoomImage, HoldRefRoomOverheadImage } from "../../data/references/HoldReference";

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
		case "charAvatar": return <CharacterAvatar r={ holdRef } />;
		case "charCommand": return <CharacterCommand r={ holdRef } />;
		case "charTiles": return <CharacterTiles r={ holdRef } />;

		case "monsterCommand": return <MonsterCommand r={ holdRef } />;

		case "roomImage": return <RoomImage r={ holdRef } />;
		case "roomOverheadImage": return <RoomOverheadImage r={ holdRef } />;

		case "notApplicable":
			return <span className="is-muted">Not Applicable</span>

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
		{" "}<strong>{character.name.finalValue}</strong>
		{" "}&rarr;{" "}<em>#{commandIndex}::{getCommandName(command.type)}</em>
	</>
}

function CharacterAvatar({ r }: {r: HoldRefCharacterAvatar}) {
	const { hold, characterId } = r;

	const character = hold.characters.getOrError(characterId);

	return <>
		<span className="icon icon-monster-ref" title="Character">
			<i className="fas fa-user"></i>
		</span>
		{" "}<strong>{character.name.finalValue}</strong>
		{" "}&rarr;{" "}<em>Avatar</em>
	</>
}

function CharacterTiles({ r }: {r: HoldRefCharacterTiles}) {
	const { hold, characterId } = r;

	const character = hold.characters.getOrError(characterId);

	return <>
		<span className="icon icon-monster-ref" title="Character">
			<i className="fas fa-user"></i>
		</span>
		{" "}<strong>{character.name.finalValue}</strong>
		{" "}&rarr;{" "}<em>Tiles</em>
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
		{" "}<strong>{level.name.finalValue}{": "}{room.$coordsName}</strong>
		{", "}{getCharacterName(hold, monster.$characterTypeId)}
		{" "}({monster.x},{monster.y})
		{" "}&rarr;{" "}<em>#{commandIndex}::{getCommandName(command.type)}</em>
	</>
}

function RoomImage({ r }: {r: HoldRefRoomImage}) {
	const { hold, roomId } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return <>
		<span className="icon icon-monster-ref" title="Monster">
			<i className="fas fa-bug"></i>
		</span>
		{" "}<strong>{level.name.finalValue}{": "}{room.$coordsName}</strong>
		{" "}&rarr;{" "}<em>Room Image</em>
	</>
}

function RoomOverheadImage({ r }: {r: HoldRefRoomOverheadImage}) {
	const { hold, roomId } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return <>
		<span className="icon icon-monster-ref" title="Monster">
			<i className="fas fa-bug"></i>
		</span>
		{" "}<strong>{level.name.finalValue}{": "}{room.$coordsName}</strong>
		{" "}&rarr;{" "}<em>Overhead Image</em>
	</>;
}