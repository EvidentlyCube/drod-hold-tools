import { getCharacterName, getCommandName } from "../../data/Utils";
import { Hold } from "../../data/datatypes/Hold";
import { HoldRef, HoldRefCharacterAvatar, HoldRefCharacterCommand, HoldRefCharacterTiles, HoldRefData, HoldRefEntranceVoiceOver, HoldRefHold, HoldRefModel, HoldRefMonsterCommand, HoldRefPlayer, HoldRefRoomImage, HoldRefRoomOverheadImage, HoldRefScroll } from "../../data/references/HoldReference";
import { shouldBeUnreachable } from "../../utils/Interfaces";

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

	const model = holdRef.model;

	switch (model) {
		case HoldRefModel.Character: return <ViewCharacter hold={holdRef.hold} characterId={holdRef.characterId} />;
		case HoldRefModel.CharacterAvatar: return <ViewCharacterAvatar r={holdRef} />;
		case HoldRefModel.CharacterCommand: return <CharacterCommand r={holdRef} />;
		case HoldRefModel.CharacterTiles: return <ViewCharacterTiles r={holdRef} />;

		case HoldRefModel.Data: return <ViewData r={holdRef} />;
		case HoldRefModel.Entrance: return <ViewEntrance hold={holdRef.hold} entranceId={holdRef.entranceId} />
		case HoldRefModel.EntranceVoiceOver: return <ViewEntranceVoiceOver r={holdRef} />

		case HoldRefModel.Hold: return <ViewHold r={holdRef} />;
		case HoldRefModel.Level: return <ViewLevel hold={holdRef.hold} levelId={holdRef.levelId} />;

		case HoldRefModel.MonsterCommand: return <ViewMonsterCommand r={holdRef} />;

		case HoldRefModel.Player: return <ViewPlayer r={holdRef} />;

		case HoldRefModel.Room: return <ViewRoom hold={holdRef.hold} roomId={holdRef.roomId} />;
		case HoldRefModel.RoomImage: return <ViewRoomImage r={holdRef} />;
		case HoldRefModel.RoomOverheadImage: return <ViewRoomOverheadImage r={holdRef} />;

		case HoldRefModel.Scroll: return <ViewScroll r={holdRef} />;
		case HoldRefModel.Speech: return <ViewSpeech hold={holdRef.hold} speechId={holdRef.speechId} />;

		case HoldRefModel.NotApplicable: return <span className="is-muted">Not Applicable</span>
		case HoldRefModel.WorldMap: return <ViewWorldMap hold={holdRef.hold} worldMapId={holdRef.worldMapId} />


		default:
			shouldBeUnreachable(model);

			return <>
				<span className="icon icon-unknown-ref">
					<i className="fas fa-question"></i>
				</span>
				{" "}<strong>Unknown ref</strong>
				{" "}<code>{(holdRef as any).model}</code>
			</>
	}
}

function ViewCharacter({ hold, characterId }: { hold: Hold, characterId: number }) {
	const character = hold.characters.getOrError(characterId);

	return <>
		<span className="icon icon-ref" title="Character">
			<i className="fas fa-person-walking"></i>
		</span>
		{" "}<strong title="Character Name">{character.name.newValue}</strong>
	</>
}

function CharacterCommand({ r }: { r: HoldRefCharacterCommand }) {
	const { hold, characterId, commandIndex } = r;

	const character = hold.characters.getOrError(characterId);
	const command = character.$commandList!.commands[commandIndex];

	return <>
		<ViewCharacter hold={hold} characterId={characterId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Character">
			<i className="fas fa-terminal"></i>
		</span>
		{" "}<em title="Command Index and Type">#{commandIndex}::{getCommandName(command.type)}</em>
	</>
}

function ViewCharacterAvatar({ r }: { r: HoldRefCharacterAvatar }) {
	const { hold, characterId } = r;

	return <>
		<ViewCharacter hold={hold} characterId={characterId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Character Portrait">
			<i className="fas fa-image-portrait"></i>
		</span>
		{" "}<em title="Type of Data Associated With Character">Avatar</em>
	</>
}

function ViewCharacterTiles({ r }: { r: HoldRefCharacterTiles }) {
	const { hold, characterId } = r;

	return <>
		<ViewCharacter hold={hold} characterId={characterId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Character Tiles">
			<i className="fas fa-table-cells-large"></i>
		</span>
		{" "}<em title="Type of Data Associated With Character">Tiles</em>
	</>
}

function ViewData({ r }: { r: HoldRefData }) {
	const { hold, dataId } = r;

	const data = hold.datas.getOrError(dataId);

	return <>
		<span className="icon icon-ref" title="Data">
			<i className="fas fa-database"></i>
		</span>
		{" "}<strong title="Data Name">{data.name.newValue}</strong>
	</>
}

function ViewHold({ r }: { r: HoldRefHold }) {
	return <>
		<span className="icon" title="Hold">
			<i className="fas fa-house-chimney"></i>
		</span>
		{" "}<strong title="The Hold Itself">The Hold Itself</strong>
	</>
}

function ViewMonsterCommand({ r }: { r: HoldRefMonsterCommand }) {
	const { hold, roomId, monsterIndex, commandIndex } = r;

	const room = hold.rooms.getOrError(roomId);
	const monster = room.monsters[monsterIndex];
	const command = monster.$commandList!.commands[commandIndex];

	return <>
		<ViewRoom hold={hold} roomId={roomId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Monster Character">
			<i className="fas fa-person-walking"></i>
		</span>
		{" "}<em title="Name of the Character Type Used">{getCharacterName(hold, monster.$characterTypeId)}</em>
		{" "}&rarr;
		<span className="icon icon-ref" title="Position">
			<i className="fas fa-location-dot"></i>
		</span>
		{" "}<em title="Coordinates of the Monster in the Room">({monster.x},{monster.y})</em>
		{" "}&rarr;
		<span className="icon icon-ref" title="Character">
			<i className="fas fa-terminal"></i>
		</span>
		{" "}<em title="Command Index and Type">#{commandIndex}::{getCommandName(command.type)}</em>
	</>
}

function ViewPlayer({ r }: { r: HoldRefPlayer }) {
	const { hold, playerId } = r;

	const player = hold.players.getOrError(playerId);

	return <>
		<span className="icon icon-ref" title="Player">
			<i className="fas fa-circle-user"></i>
		</span>
		{" "}<strong title="Player Name">{player.name.newValue}</strong>
	</>
}
function ViewRoom({ hold, roomId }: { hold: Hold, roomId: number }) {
	const room = hold.rooms.getOrError(roomId);

	return <>
		<ViewLevel hold={hold} levelId={room.levelId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Room">
			<i className="fas fa-kaaba"></i>
		</span>
		{" "}<strong title="Room Coordinates in Level">{room.$coordsName}</strong>
	</>
}

function ViewRoomImage({ r }: { r: HoldRefRoomImage }) {
	const { hold, roomId } = r;

	return <>
		<ViewRoom hold={hold} roomId={roomId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Room Image">
			<i className="fas fa-arrows-down-to-line"></i>
		</span>
		{" "}<em title="Type of Data Associated With the Room">Room Image</em>
	</>
}

function ViewRoomOverheadImage({ r }: { r: HoldRefRoomOverheadImage }) {
	const { hold, roomId } = r;

	return <>
		<ViewRoom hold={hold} roomId={roomId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Room Overhead Image">
			<i className="fas fa-arrows-up-to-line"></i>
		</span>
		{" "}<em title="Type of Data Associated With the Room">Overhead Image</em>
	</>
}

function ViewScroll({ r }: { r: HoldRefScroll }) {
	const { hold, roomId, x, y } = r;

	return <>
		<ViewRoom hold={hold} roomId={roomId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Scroll">
			<i className="fas fa-scroll"></i>
		</span>
		<em title="Scroll Coordinates">({x},{y})</em>
	</>;
}

function ViewSpeech({ hold, speechId }: { hold: Hold, speechId: number }) {
	const speech = hold.speeches.getOrError(speechId);

	return <>
		<HoldRefView holdRef={speech.$location} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Speech">
			<i className="far fa-comment"></i>
		</span>
		{" "}<em title="It's a Speech">Speech</em>
	</>;
}

function ViewEntranceVoiceOver({ r }: { r: HoldRefEntranceVoiceOver }) {
	const { hold, entranceId } = r;

	return <>
		<ViewEntrance hold={hold} entranceId={entranceId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Voiceover">
			<i className="fas fa-microphone"></i>
		</span>
		{" "}<em title="Type of Data Associated with the Entrance">Voiceover</em>
	</>;
}

function ViewEntrance({ hold, entranceId }: { hold: Hold, entranceId: number }) {
	const entrance = hold.entrances.getOrError(entranceId);

	return <>
		<ViewRoom hold={hold} roomId={entrance.roomId} />
		{" "}&rarr;
		<span className="icon icon-ref" title="Entrance">
			<i className="fas fa-door-open"></i>
		</span>
		{" "}<strong title="Entrance coordinates in Room">({entrance.x}, {entrance.y})</strong>
	</>
}

function ViewLevel({ hold, levelId }: { hold: Hold, levelId: number }) {
	const level = hold.levels.getOrError(levelId);

	return <>
		<span className="icon icon-ref" title="Level">
			<i className="fas fa-layer-group"></i>
		</span>
		{" "}<strong title="Level Name">{level.name.newValue}</strong>
	</>
}

function ViewWorldMap({ hold, worldMapId }: { hold: Hold, worldMapId: number }) {
	const worldMap = hold.worldMaps.getOrError(worldMapId);

	return <>
		<span className="icon icon-ref" title="Entrance">
			<i className="fas fa-map"></i>
		</span>
		{" "}<strong title="World Map Name">{worldMap.name.newValue}</strong>
	</>
}