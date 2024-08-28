import { getCharacterName, getCommandName } from "../../data/Utils";
import { HoldRef, HoldRefCharacter, HoldRefCharacterAvatar, HoldRefCharacterCommand, HoldRefCharacterTiles, HoldRefData, HoldRefHold, HoldRefLevel, HoldRefMonsterCommand, HoldRefPlayer, HoldRefRoom, HoldRefRoomImage, HoldRefRoomOverheadImage, HoldRefScroll, HoldRefSpeech } from "../../data/references/HoldReference";

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
		case "character": return <Character r={ holdRef } />;
		case "charAvatar": return <CharacterAvatar r={ holdRef } />;
		case "charCommand": return <CharacterCommand r={ holdRef } />;
		case "charTiles": return <CharacterTiles r={ holdRef } />;

		case "data": return <Data r={ holdRef } />;
		case "hold": return <Hold r={ holdRef } />;
		case "level": return <Level r={ holdRef } />;

		case "monsterCommand": return <MonsterCommand r={ holdRef } />;
		case "player": return <Player r={ holdRef } />;

		case "room": return <Room r={ holdRef } />;
		case "roomImage": return <RoomImage r={ holdRef } />;
		case "roomOverheadImage": return <RoomOverheadImage r={ holdRef } />;

		case "scroll": return <Scroll r={ holdRef } />;
		case "speech": return <Speech r={ holdRef } />;

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

function Character({ r }: {r: HoldRefCharacter}) {
	const { hold, characterId } = r;

	const character = hold.characters.getOrError(characterId);

	return <>
		<span className="icon icon-ref" title="Character">
			<i className="fas fa-person-walking"></i>
		</span>
		{" "}<strong>{character.name.newValue}</strong>
	</>
}

function CharacterCommand({ r }: {r: HoldRefCharacterCommand}) {
	const { hold, characterId, commandIndex } = r;

	const character = hold.characters.getOrError(characterId);
	const command = character.$commandList!.commands[commandIndex];

	return <>
		<span className="icon icon-ref" title="Character">
			<i className="fas fa-person-walking"></i>
		</span>
		{" "}<strong>{character.name.newValue}</strong>
		{" "}&rarr;{" "}<em>#{commandIndex}::{getCommandName(command.type)}</em>
	</>
}

function CharacterAvatar({ r }: {r: HoldRefCharacterAvatar}) {
	const { hold, characterId } = r;

	const character = hold.characters.getOrError(characterId);

	return <>
		<span className="icon icon-ref" title="Character">
			<i className="fas fa-person-walking"></i>
		</span>
		{" "}<strong>{character.name.newValue}</strong>
		{" "}&rarr;{" "}<em>Avatar</em>
	</>
}

function CharacterTiles({ r }: {r: HoldRefCharacterTiles}) {
	const { hold, characterId } = r;

	const character = hold.characters.getOrError(characterId);

	return <>
		<span className="icon icon-ref" title="Character">
			<i className="fas fa-person-walking"></i>
		</span>
		{" "}<strong>{character.name.newValue}</strong>
		{" "}&rarr;{" "}<em>Tiles</em>
	</>
}

function Data({ r }: {r: HoldRefData}) {
	const { hold, dataId } = r;

	const data = hold.datas.getOrError(dataId);

	return <>
		<span className="icon icon-ref" title="Data">
			<i className="fas fa-database"></i>
		</span>
		{" "}<strong>{data.name.newValue}</strong>
	</>
}

function Hold({ r }: {r: HoldRefHold}) {
	return <>
		<span className="icon" title="Hold">
			<i className="fas fa-house-chimney"></i>
		</span>
		{" "}<strong>The Hold Itself</strong>
	</>
}

function Level({ r }: {r: HoldRefLevel}) {
	const {hold, levelId} = r;

	const level = hold.levels.getOrError(levelId);

	return <>
		<span className="icon" title="Level">
			<i className="fas fa-layer-group"></i>
		</span>
		{" "}<strong>{level.name.newValue}</strong>
	</>
}

function MonsterCommand({ r }: {r: HoldRefMonsterCommand}) {
	const { hold, roomId, monsterIndex, commandIndex } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;
	const monster = room.monsters[monsterIndex];
	const command = monster.$commandList!.commands[commandIndex];

	return <>
		<span className="icon icon-ref" title="Monster">
			<i className="fas fa-bug"></i>
		</span>
		{" "}<strong>{level.name.newValue}{": "}{room.$coordsName}</strong>
		{", "}{getCharacterName(hold, monster.$characterTypeId)}
		{" "}({monster.x},{monster.y})
		{" "}&rarr;{" "}<em>#{commandIndex}::{getCommandName(command.type)}</em>
	</>
}

function Player({ r }: {r: HoldRefPlayer}) {
	const { hold, playerId } = r;

	const player = hold.players.getOrError(playerId);

	return <>
		<span className="icon icon-ref" title="Room">
			<i className="fas fa-circle-user"></i>
		</span>
		{" "}<strong>{player.name.newValue}</strong>
	</>
}
function Room({ r }: {r: HoldRefRoom}) {
	const { hold, roomId } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return <>
		<span className="icon icon-ref" title="Room">
			<i className="fas fa-kaaba"></i>
		</span>
		{" "}<strong>{level.name.newValue}{": "}{room.$coordsName}</strong>
	</>
}

function RoomImage({ r }: {r: HoldRefRoomImage}) {
	const { hold, roomId } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return <>
		<span className="icon icon-ref" title="Room">
			<i className="fas fa-kaaba"></i>
		</span>
		{" "}<strong>{level.name.newValue}{": "}{room.$coordsName}</strong>
		{" "}&rarr;{" "}<em>Room Image</em>
	</>
}

function RoomOverheadImage({ r }: {r: HoldRefRoomOverheadImage}) {
	const { hold, roomId } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return <>
		<span className="icon icon-ref" title="Room">
			<i className="fas fa-kaaba"></i>
		</span>
		{" "}<strong>{level.name.newValue}{": "}{room.$coordsName}</strong>
		{" "}&rarr;{" "}<em>Overhead Image</em>
	</>;
}

function Scroll({ r }: {r: HoldRefScroll}) {
	const { hold, roomId, x, y } = r;

	const room = hold.rooms.getOrError(roomId);
	const level = room.$level;

	return <>
		<span className="icon icon-ref" title="Scroll">
			<i className="fas fa-scroll"></i>
		</span>
		{" "}<strong>
			<span title="Level Name">{level.name.newValue}</span>
			{": "}
			<span title="Room Coordinates">{room.$coordsName}</span>
		</strong>
		{" "}&rarr;{" "}
		<em title="Scroll Coordinates">({x},{y})</em>
	</>;
}

function Speech({ r }: {r: HoldRefSpeech}) {
	const { hold, speechId } = r;

	const speech = hold.speeches.getOrError(speechId);

	return <>
		<span className="icon icon-ref" title="Speech">
			<i className="far fa-comment"></i>
		</span>
		Speech in: <HoldRefView holdRef={speech.$location} />
	</>;
}