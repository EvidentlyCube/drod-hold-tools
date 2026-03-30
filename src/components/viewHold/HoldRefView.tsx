import type { CommandsList } from "../../data/CommandList";
import type { Hold } from "../../data/datatypes/Hold";
import type { ScriptCommand } from "../../data/datatypes/ScriptCommand";
import {
	type HoldRef,
	type HoldRefCharacterAvatar,
	type HoldRefCharacterCommand,
	type HoldRefCharacterTiles,
	type HoldRefData,
	type HoldRefEntranceVoiceOver,
	HoldRefModel,
	type HoldRefMonsterCharacterType,
	type HoldRefMonsterCommand,
	type HoldRefPlayer,
	type HoldRefRoomImage,
	type HoldRefRoomOverheadImage,
	type HoldRefSavedGameWorldMapIcon,
	type HoldRefScroll,
} from "../../data/references/HoldReference";
import {
	getCharacterName,
	getCommandName,
	getCommandToString,
} from "../../data/Utils";
import { shouldBeUnreachable } from "../../utils/Interfaces";

interface HoldRefsTableListProps {
	holdRefs: readonly HoldRef[];
}

export function HoldRefsTableList({ holdRefs }: HoldRefsTableListProps) {
	return (
		<table>
			<tbody>
				{holdRefs.map((ref, index) => (
					// biome-ignore lint: It's okay it won't change
					<tr key={index}>
						<td>
							<HoldRefView holdRef={ref} />
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

interface HoldRefViewProps {
	holdRef?: HoldRef;
}

export default function HoldRefView({ holdRef }: HoldRefViewProps) {
	if (!holdRef) {
		return (
			<>
				<i className="fa-icon fa-question icon icon-unknown-ref"></i>{" "}
				<strong>Unknown</strong>
			</>
		);
	}

	const model = holdRef.model;

	switch (model) {
		case HoldRefModel.Character:
			return (
				<ViewCharacter hold={holdRef.hold} characterId={holdRef.characterId} />
			);
		case HoldRefModel.CharacterAvatar:
			return <ViewCharacterAvatar r={holdRef} />;
		case HoldRefModel.CharacterCommand:
			return <CharacterCommand r={holdRef} />;
		case HoldRefModel.CharacterTiles:
			return <ViewCharacterTiles r={holdRef} />;

		case HoldRefModel.Data:
			return <ViewData r={holdRef} />;
		case HoldRefModel.Entrance:
			return (
				<ViewEntrance hold={holdRef.hold} entranceId={holdRef.entranceId} />
			);
		case HoldRefModel.EntranceVoiceOver:
			return <ViewEntranceVoiceOver r={holdRef} />;

		case HoldRefModel.Hold:
			return <ViewHold />;
		case HoldRefModel.HoldEndMessage:
			return <ViewHoldEndMessage />;
		case HoldRefModel.Level:
			return <ViewLevel hold={holdRef.hold} levelId={holdRef.levelId} />;

		case HoldRefModel.MonsterCharacterType:
			return <ViewMonsterCharacterType r={holdRef} />;
		case HoldRefModel.MonsterCommand:
			return <ViewMonsterCommand r={holdRef} />;

		case HoldRefModel.Player:
			return <ViewPlayer r={holdRef} />;

		case HoldRefModel.Room:
			return <ViewRoom hold={holdRef.hold} roomId={holdRef.roomId} />;
		case HoldRefModel.RoomImage:
			return <ViewRoomImage r={holdRef} />;
		case HoldRefModel.RoomOverheadImage:
			return <ViewRoomOverheadImage r={holdRef} />;

		case HoldRefModel.SavedGameWorldMapIcon:
			return <ViewSavedGameWorldMapIcon r={holdRef} />;
		case HoldRefModel.Scroll:
			return <ViewScroll r={holdRef} />;
		case HoldRefModel.Speech:
			return <ViewSpeech hold={holdRef.hold} speechId={holdRef.speechId} />;

		case HoldRefModel.NotApplicable:
			return <span className="is-muted">Not Applicable</span>;
		case HoldRefModel.WorldMap:
			return (
				<ViewWorldMap hold={holdRef.hold} worldMapId={holdRef.worldMapId} />
			);
		case HoldRefModel.Variable:
			return (
				<ViewVariable hold={holdRef.hold} variableId={holdRef.variableId} />
			);

		default:
			shouldBeUnreachable(model);

			return (
				<>
					<span className="icon icon-unknown-ref">
						<i className="fas fa-question"></i>
					</span>{" "}
					<strong>Unknown ref</strong> <code>{(holdRef as HoldRef).model}</code>
				</>
			);
	}
}

function ViewCharacter({
	hold,
	characterId,
}: {
	hold: Hold;
	characterId: number;
}) {
	const character = hold.characters.getOrError(characterId);

	return (
		<>
			<span className="icon icon-ref" title="Character">
				<i className="fas fa-person-walking"></i>
			</span>{" "}
			<strong title="Character Name">{character.name.newValue}</strong>
		</>
	);
}

function CharacterCommand({ r }: { r: HoldRefCharacterCommand }) {
	const { hold, characterId, commandIndex } = r;

	const { $commandList } = hold.characters.getOrError(characterId);
	const command = $commandList?.commands[commandIndex];

	return (
		<>
			<ViewCharacter hold={hold} characterId={characterId} /> &rarr;
			<span className="icon icon-ref" title="Command index and type">
				<i className="fas fa-terminal"></i>
			</span>{" "}
			<em title="Command Index and Type">
				#{commandIndex}::
				{command ? getCommandName(command.type) : "Unable to retrieve command"}
			</em>{" "}
			&mdash;{" "}
			{command && $commandList
				? CommandLine({ command, list: $commandList })
				: "unable to retrieve command"}
		</>
	);
}

function CommandLine({
	command,
	list,
}: {
	command: ScriptCommand;
	list: CommandsList;
}) {
	return <code>{getCommandToString(command, list)}</code>;
}

function ViewCharacterAvatar({ r }: { r: HoldRefCharacterAvatar }) {
	const { hold, characterId } = r;

	return (
		<>
			<ViewCharacter hold={hold} characterId={characterId} /> &rarr;
			<span className="icon icon-ref" title="Character Portrait">
				<i className="fas fa-image-portrait"></i>
			</span>{" "}
			<em title="Type of Data Associated With Character">Avatar</em>
		</>
	);
}

function ViewCharacterTiles({ r }: { r: HoldRefCharacterTiles }) {
	const { hold, characterId } = r;

	return (
		<>
			<ViewCharacter hold={hold} characterId={characterId} /> &rarr;
			<span className="icon icon-ref" title="Character Tiles">
				<i className="fas fa-table-cells-large"></i>
			</span>{" "}
			<em title="Type of Data Associated With Character">Tiles</em>
		</>
	);
}

function ViewData({ r }: { r: HoldRefData }) {
	const { hold, dataId } = r;

	const data = hold.datas.getOrError(dataId);

	return (
		<>
			<span className="icon icon-ref" title="Data">
				<i className="fas fa-database"></i>
			</span>{" "}
			<strong title="Data Name">{data.name.newValue}</strong>
		</>
	);
}

function ViewHold() {
	return (
		<>
			<span className="icon" title="Hold">
				<i className="fas fa-house-chimney"></i>
			</span>{" "}
			<strong title="The Hold Itself">The Hold Itself</strong>
		</>
	);
}

function ViewHoldEndMessage() {
	return (
		<>
			<span className="icon" title="Hold">
				<i className="fas fa-house-chimney"></i>
			</span>{" "}
			<strong title="Hold end message">Hold end message</strong>
		</>
	);
}

function ViewMonsterCharacterType({ r }: { r: HoldRefMonsterCharacterType }) {
	const { hold, roomId, monsterIndex } = r;

	const room = hold.rooms.getOrError(roomId);
	const monster = room.monsters[monsterIndex];

	return (
		<>
			<ViewRoom hold={hold} roomId={roomId} /> &rarr;
			<span className="icon icon-ref" title="Monster Character">
				<i className="fas fa-person-walking"></i>
			</span>{" "}
			<em title="Name of the Character Type Used">
				{getCharacterName(hold, monster.$characterTypeId)}
			</em>{" "}
			&rarr;
			<span className="icon icon-ref" title="Position">
				<i className="fas fa-location-dot"></i>
			</span>{" "}
			<em title="Coordinates of the Monster in the Room">
				({monster.x},{monster.y})
			</em>{" "}
			&rarr;
			<span className="icon icon-ref" title="Character">
				<i className="fas fa-terminal"></i>
			</span>{" "}
			<em title="Command Index and Type">Character type</em>
		</>
	);
}

function ViewMonsterCommand({ r }: { r: HoldRefMonsterCommand }) {
	const { hold, roomId, monsterIndex, commandIndex } = r;

	const room = hold.rooms.getOrError(roomId);
	const monster = room.monsters[monsterIndex];
	const { $commandList } = monster;
	const command = $commandList?.commands[commandIndex];

	return (
		<>
			<ViewRoom hold={hold} roomId={roomId} /> &rarr;
			<span className="icon icon-ref" title="Monster Character">
				<i className="fas fa-person-walking"></i>
			</span>{" "}
			<em title="Name of the Character Type Used">
				{getCharacterName(hold, monster.$characterTypeId)}
			</em>{" "}
			&rarr;
			<span className="icon icon-ref" title="Position">
				<i className="fas fa-location-dot"></i>
			</span>{" "}
			<em title="Coordinates of the Monster in the Room">
				({monster.x},{monster.y})
			</em>{" "}
			&rarr;
			<span className="icon icon-ref" title="Character">
				<i className="fas fa-terminal"></i>
			</span>{" "}
			<em title="Command Index and Type">
				#{commandIndex}::
				{command ? getCommandName(command.type) : "Unable to retrieve command"}
			</em>{" "}
			&mdash;{" "}
			{command && $commandList
				? CommandLine({ command, list: $commandList })
				: "Unable to retrieve command"}
		</>
	);
}

function ViewPlayer({ r }: { r: HoldRefPlayer }) {
	const { hold, playerId } = r;

	const player = hold.players.getOrError(playerId);

	return (
		<>
			<span className="icon icon-ref" title="Player">
				<i className="fas fa-circle-user"></i>
			</span>{" "}
			<strong title="Player Name">{player.name.newValue}</strong>
		</>
	);
}
function ViewRoom({ hold, roomId }: { hold: Hold; roomId: number }) {
	const room = hold.rooms.getOrError(roomId);

	return (
		<>
			<ViewLevel hold={hold} levelId={room.levelId} /> &rarr;
			<span className="icon icon-ref" title="Room">
				<i className="fas fa-kaaba"></i>
			</span>{" "}
			<strong title="Room Coordinates in Level">{room.$coordsName}</strong>
		</>
	);
}

function ViewRoomImage({ r }: { r: HoldRefRoomImage }) {
	const { hold, roomId } = r;

	return (
		<>
			<ViewRoom hold={hold} roomId={roomId} /> &rarr;
			<span className="icon icon-ref" title="Room Image">
				<i className="fas fa-arrows-down-to-line"></i>
			</span>{" "}
			<em title="Type of Data Associated With the Room">Room Image</em>
		</>
	);
}

function ViewRoomOverheadImage({ r }: { r: HoldRefRoomOverheadImage }) {
	const { hold, roomId } = r;

	return (
		<>
			<ViewRoom hold={hold} roomId={roomId} /> &rarr;
			<span className="icon icon-ref" title="Room Overhead Image">
				<i className="fas fa-arrows-up-to-line"></i>
			</span>{" "}
			<em title="Type of Data Associated With the Room">Overhead Image</em>
		</>
	);
}

function ViewSavedGameWorldMapIcon({ r }: { r: HoldRefSavedGameWorldMapIcon }) {
	const { savedGameId, worldMapIconIndex } = r;

	return (
		<>
			<RefIcon icon="floppy-disk" title="Saved Game" /> ID={savedGameId} &rarr;
			<RefIcon icon="list-ol" title="Index of the save (1 indexed)" />{" "}
			{worldMapIconIndex + 1}
		</>
	);
}

function ViewScroll({ r }: { r: HoldRefScroll }) {
	const { hold, roomId, x, y } = r;

	return (
		<>
			<ViewRoom hold={hold} roomId={roomId} /> &rarr;
			<span className="icon icon-ref" title="Scroll">
				<i className="fas fa-scroll"></i>
			</span>
			<em title="Scroll Coordinates">
				({x},{y})
			</em>
		</>
	);
}

function ViewSpeech({ hold, speechId }: { hold: Hold; speechId: number }) {
	const speech = hold.speeches.getOrError(speechId);

	return (
		<>
			<HoldRefView holdRef={speech.$location} /> &rarr;
			<span className="icon icon-ref" title="Speech">
				<i className="far fa-comment"></i>
			</span>{" "}
			<em title="It's a Speech">Speech</em>
		</>
	);
}

function ViewEntranceVoiceOver({ r }: { r: HoldRefEntranceVoiceOver }) {
	const { hold, entranceId } = r;

	return (
		<>
			<ViewEntrance hold={hold} entranceId={entranceId} /> &rarr;
			<span className="icon icon-ref" title="Voiceover">
				<i className="fas fa-microphone"></i>
			</span>{" "}
			<em title="Type of Data Associated with the Entrance">Voiceover</em>
		</>
	);
}

function ViewEntrance({
	hold,
	entranceId,
}: {
	hold: Hold;
	entranceId: number;
}) {
	const entrance = hold.entrances.getOrError(entranceId);

	return (
		<>
			<ViewRoom hold={hold} roomId={entrance.roomId} /> &rarr;
			<span className="icon icon-ref" title="Entrance">
				<i className="fas fa-door-open"></i>
			</span>{" "}
			<strong title="Entrance coordinates in Room">
				({entrance.x}, {entrance.y})
			</strong>
		</>
	);
}

function ViewLevel({ hold, levelId }: { hold: Hold; levelId: number }) {
	const level = hold.levels.getOrError(levelId);

	return (
		<>
			<span className="icon icon-ref" title="Level">
				<i className="fas fa-layer-group"></i>
			</span>{" "}
			<strong title="Level Name">{level.name.newValue}</strong>
		</>
	);
}

function ViewWorldMap({
	hold,
	worldMapId,
}: {
	hold: Hold;
	worldMapId: number;
}) {
	const worldMap = hold.worldMaps.getOrError(worldMapId);

	return (
		<>
			<span className="icon icon-ref" title="World Map">
				<i className="fas fa-map"></i>
			</span>{" "}
			<strong title="World Map Name">{worldMap.name.newValue}</strong>
		</>
	);
}

function ViewVariable({
	hold,
	variableId,
}: {
	hold: Hold;
	variableId: number;
}) {
	const variable = hold.variables.getOrError(variableId);

	return (
		<>
			<RefIcon icon="xmark" title="Variable" />{" "}
			<strong title="Variable Name">{variable.name.newValue}</strong>
		</>
	);
}

interface RefIconProps {
	icon: string;
	title: string;
}
function RefIcon({ icon, title }: RefIconProps) {
	return (
		<span className="icon icon-ref" title={title}>
			<i className={`fas fa-${icon}`}></i>
		</span>
	);
}
