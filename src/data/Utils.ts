import type { OptGroup } from "../components/common/Select";
import { shouldBeUnreachable } from "../utils/Interfaces";
import {
	base64ToUint8,
	bytesArrToBase64 as bytesToBase64,
} from "../utils/StringUtils";
import type { CommandsList } from "./CommandList";
import { DataFormat, ScriptCommandType, Speaker } from "./DrodEnums";
import {
	DataFormatToName,
	MonsterIdToName,
	MoodToName,
	ScriptCommandTypeToName,
	SpeakerToName,
} from "./DrodEnumToName";
import type { Hold } from "./datatypes/Hold";
import type { HoldDataDetails } from "./datatypes/HoldData";
import type { ScriptCommand } from "./datatypes/ScriptCommand";
import { TextUtils } from "./TextUtils";

export function isGzippedNonDecodedHold(holdBinaryData: Uint8Array) {
	return holdBinaryData[0] === 0x1f && holdBinaryData[1] === 0x8b;
}

export function wcharBase64ToString(encodedText: string) {
	const decodedData = base64ToUint8(encodedText);

	const codePoints = [];
	for (let i = 0; i < decodedData.length; i += 2) {
		codePoints.push(decodedData[i] | (decodedData[i + 1] << 8));
	}

	return String.fromCharCode(...codePoints);
}

export function stringToWCharBase64(s: string) {
	const bytes = [];

	for (let i = 0; i < s.length; i++) {
		const charCode = s.charCodeAt(i);
		if (charCode > 128) {
			bytes.push(charCode & 0xff);
			bytes.push(charCode >> 8);
		} else {
			bytes.push(charCode);
			bytes.push(0);
		}
	}

	return bytesToBase64(bytes);
}

export function stringToUint8(str: string) {
	const bytes = new Uint8Array(str.length);

	for (let i = 0; i < str.length; i++) {
		bytes[i] = str.codePointAt(i) ?? 0;
	}

	return bytes;
}

export function downloadBlob(
	data: Uint8Array<ArrayBuffer>,
	fileName: string,
	mimeType: string,
) {
	const blob = new Blob([data], {
		type: mimeType,
	});

	const url = window.URL.createObjectURL(blob);
	downloadURL(url, fileName);
	setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export function downloadURL(dataUrl: string, fileName: string) {
	const a = document.createElement("a");
	a.href = dataUrl;
	a.download = fileName;
	document.body.appendChild(a);
	a.style.display = "none";
	a.click();
	a.remove();
}

function getXName(x: number) {
	if (x > 0) {
		return `${x}E`;
	} else if (x < 0) {
		return `${-x}W`;
	} else {
		return "";
	}
}

function getYName(y: number) {
	if (y > 0) {
		return `${y}S`;
	} else if (y < 0) {
		return `${-y}N`;
	} else {
		return "";
	}
}

export function getCoordinateName(x: number, y: number) {
	return x === 0 && y === 0 ? "Entrance" : `${getYName(y)}${getXName(x)}`;
}

export function getCharacterName(hold: Hold, characterId: number): string {
	return (
		MonsterIdToName.get(characterId)
		?? hold.characters.get(characterId)?.name.newValue
		?? `Unknown Character [ID=${characterId}]`
	);
}

export function getSpeakerName(
	hold: Hold,
	speakerId: number,
	x: number = 0,
	y: number = 0,
): string {
	if (speakerId === Speaker.Custom) {
		return `${SpeakerToName.get(speakerId)} (${x},${y})`;
	}

	return (
		SpeakerToName.get(speakerId)
		?? hold.characters.get(speakerId)?.name.newValue
		?? `Unknown Speaker [ID=${speakerId}]`
	);
}

export function getCommandName(type: ScriptCommandType): string {
	return ScriptCommandTypeToName.get(type) ?? `Unknown Command[${type}]`;
}

export function getCommandsToString(
	list: CommandsList | undefined,
	baseIndent: number = 0,
): string {
	if (!list) {
		return "";
	}

	const lines: string[] = [];
	const indent = "  ";
	let indentLevel = baseIndent;
	let wasIf = false;

	for (const command of list.commands) {
		if (
			command.type === ScriptCommandType.CC_IfElse
			|| command.type === ScriptCommandType.CC_IfElseIf
			|| command.type === ScriptCommandType.CC_IfEnd
		) {
			indentLevel = Math.max(indentLevel - 1, baseIndent);
		}

		if (command.type === ScriptCommandType.CC_Label) {
			lines.push(
				`${indent.repeat(baseIndent)}${getCommandToString(command, list)}:`,
			);
		} else {
			lines.push(
				indent.repeat(1 + indentLevel + (wasIf ? 1 : 0))
					+ getCommandToString(command, list),
			);
		}

		wasIf =
			command.type === ScriptCommandType.CC_If
			|| command.type === ScriptCommandType.CC_IfElseIf;

		if (
			command.type === ScriptCommandType.CC_If
			|| command.type === ScriptCommandType.CC_IfElseIf
			|| command.type === ScriptCommandType.CC_IfElse
		) {
			indentLevel++;
		}
	}

	return lines.join("\n");
}

export function getCommandToString(
	c: ScriptCommand,
	context: CommandsList,
): string {
	const speech = context.hold.speeches.get(c.speechId.newValue);
	const labelCommand = context.getCommandWithLabel(c.x);
	const { hold } = context;
	const {
		appearanceMonster,
		appearancePlayer,
		attack,
		behavior,
		dir,
		displayFilter,
		effect,
		entity,
		event,
		hex,
		imperative,
		input,
		join,
		lightColor,
		monster,
		movementType,
		music,
		natTarget,
		onOff,
		openClose,
		playerBehavior,
		playerBehaviorState,
		playerState,
		scriptVarComp,
		stealth,
		stripNewline,
		tile,
		tileGroup,
		variable,
		waitFlags,
		waterTraversal,
		weapon,
		weaponFlags,
		wh,
		worldMapIcon,
		xy,
		xywh,
	} = TextUtils;

	switch (c.type) {
		case ScriptCommandType.CC_ActivateItemAt:
			return `Active item at ${xy(c)}`;
		case ScriptCommandType.CC_AddRoomToMap:
			return `Add room to map ${xy(c)}`;
		case ScriptCommandType.CC_AmbientSound:
			return `Ambient sound ${wh(c)}`;
		case ScriptCommandType.CC_AmbientSoundAt:
			return `Ambient sound at ${xy(c)},${wh(c)}`;
		case ScriptCommandType.CC_AnswerOption:
			return `Answer option "${speech?.message.newValue ?? "?"}",${labelCommand?.label.newValue ?? "?"}`;
		case ScriptCommandType.CC_Appear:
			return "Appear";
		case ScriptCommandType.CC_AppearAt:
			return `Appear at ${xy(c)}`;
		case ScriptCommandType.CC_ArrayVarSet:
			return TextUtils.arrayVarSet(c, context);
		case ScriptCommandType.CC_ArrayVarSetAt:
			return TextUtils.arrayVarSetAt(c, context);
		case ScriptCommandType.CC_AttackTile:
			return `Attack tile ${xy(c)},${attack(c.flags)}`;
		case ScriptCommandType.CC_Behavior:
			return `Behavior ${behavior(c.x)},${onOff(c.y)}`;
		case ScriptCommandType.CC_Build:
			return `Build ${tile(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_BuildMarker:
			return `Build Marker ${tile(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_ChallengeCompleted:
			return `Challenge completed ${c.label.newValue}`;
		case ScriptCommandType.CC_ClearArrayVar:
			return `Clear array var ${variable(c.x, hold)}`;
		case ScriptCommandType.CC_CountArrayEntries:
			return TextUtils.countArrayEntries(c, context);
		case ScriptCommandType.CC_CountEntityType:
			return `Count entity type ${entity(c.flags, hold)} at ${xywh(c)}`;
		case ScriptCommandType.CC_CountItem:
			return `Count item ${tile(c.flags)} at ${xywh(c)}`;
		case ScriptCommandType.CC_CutScene:
			return `Cut scene ${c.x}`;
		case ScriptCommandType.CC_DestroyTrapdoor:
			return `Destroy Trapdoor ${xywh(c)}`;
		case ScriptCommandType.CC_Disappear:
			return `Disappear`;
		case ScriptCommandType.CC_DisplayFilter:
			return `Display filter ${displayFilter(c.x)}`;
		case ScriptCommandType.CC_EndScript:
			return `End`;
		case ScriptCommandType.CC_EndScriptOnExit:
			return `End on room exit`;
		case ScriptCommandType.CC_FaceDirection:
			return `Face direction ${dir(c.x)}`;
		case ScriptCommandType.CC_FaceTowards:
			return c.flags
				? `Face towards ${waitFlags(c.flags)} ${c.w}`
				: `face towards ${xy(c)},${c.w}`;
		case ScriptCommandType.CC_FlashingText:
			return join([
				"Flashing message ",
				c.h ? `(${hex(c.x)}${hex(c.y)}${hex(c.w)}),` : "",
				`"${speech?.message.newValue ?? "?"}"`,
			]);
		case ScriptCommandType.CC_FlushSpeech:
			return `Flush speech ${onOff(c.x)}`;
		case ScriptCommandType.CC_GameEffect:
			return `Game effect ${dir(c.w)},${effect(c.h)},${xy(c)},${onOff(c.flags)}`;
		case ScriptCommandType.CC_GenerateEntity:
			return `Generate entity ${entity(c.h, hold)},${xy(c)},${dir(c.w)}`;
		case ScriptCommandType.CC_GetEntityDirection:
			return `Get entity direction ${xy(c)}`;
		case ScriptCommandType.CC_GetNaturalTarget:
			return `Get natural target ${natTarget(c.x)}`;
		case ScriptCommandType.CC_GoSub:
			return `GoSub ${labelCommand?.label.newValue ?? "?"}`;
		case ScriptCommandType.CC_GoTo:
			return `Go to ${labelCommand?.label.newValue ?? "?"}`;
		case ScriptCommandType.CC_If:
			return `If ...`;
		case ScriptCommandType.CC_IfNot:
			return `If Not ...`;
		case ScriptCommandType.CC_IfElse:
			return `Else`;
		case ScriptCommandType.CC_IfElseIf:
			return `Else If`;
		case ScriptCommandType.CC_IfElseIfNot:
			return `Else If Not`;
		case ScriptCommandType.CC_IfEnd:
			return `If End`;
		case ScriptCommandType.CC_ImageOverlay:
			return `Image overlay ${c.w},${stripNewline(c.label.newValue)}`;
		case ScriptCommandType.CC_Imperative:
			return `Imperative ${imperative(c.x)}`;
		case ScriptCommandType.CC_Label:
			return `${c.label.newValue}`;
		case ScriptCommandType.CC_LevelEntrance:
			return `Level entrance ${xy(c)}`;
		case ScriptCommandType.CC_LinkOrb:
			return `Link Orb ${xy(c)} to ${wh(c)} ${openClose(c.flags)}`;
		case ScriptCommandType.CC_LogicalWaitAnd:
			return `Wait for All:`;
		case ScriptCommandType.CC_LogicalWaitEnd:
			return `Wait for Conditions End`;
		case ScriptCommandType.CC_LogicalWaitNOR:
			return `Wait for None:`;
		case ScriptCommandType.CC_LogicalWaitOr:
			return `Wait for Any:`;
		case ScriptCommandType.CC_LogicalWaitXOR:
			return `Wait for Exactly One:`;
		case ScriptCommandType.CC_MoveRel:
			return join(["Move ", !c.flags ? `${xy(c)},` : "", wh(c)]);
		case ScriptCommandType.CC_MoveTo:
			return join([
				"Move to",
				waitFlags(c.flags),
				!c.flags ? `${xy(c)},` : "",
				wh(c),
			]);
		case ScriptCommandType.CC_PlayerEquipsWeapon:
			return `Set player sword ${onOff(c.x)}`;
		case ScriptCommandType.CC_PlayVideo:
			return `Play video ${xy(c)},${c.w}`;
		case ScriptCommandType.CC_PushTile:
			return `Push tile ${xy(c)} ${dir(c.w)}`;
		case ScriptCommandType.CC_Question:
			return `Question "${speech?.message.newValue ?? "?"}"`;
		case ScriptCommandType.CC_ReplaceWithDefault:
			return `Replace with Default Script`;
		case ScriptCommandType.CC_ResetOverrides:
			return `Reset _MyScript variables`;
		case ScriptCommandType.CC_Return:
			return `Return`;
		case ScriptCommandType.CC_RoomLocationText:
			return `Room location text "${speech?.message.newValue ?? "?"}"`;
		case ScriptCommandType.CC_SelectSquare:
			return `Select square ${c.x ? "(Restricted)" : ""}`;
		case ScriptCommandType.CC_SetCeilingLight:
			return `Set ceiling light ${lightColor(c.flags)} at ${xywh(c)}`;
		case ScriptCommandType.CC_SetDarkness:
			return `Set ceiling darkness ${c.flags} at ${xywh(c)}`;
		case ScriptCommandType.CC_SetEntityWeapon:
			return `Set entity weapon ${weapon(c.w)} at ${xy(c)}`;
		case ScriptCommandType.CC_SetMovementType:
			return `Set movement type ${movementType(c.x)}`;
		case ScriptCommandType.CC_SetMusic:
			return `Set music ${music(c)}`;
		case ScriptCommandType.CC_SetNPCAppearance:
			return `Set appearance ${appearanceMonster(c.x, hold)}`;
		case ScriptCommandType.CC_SetPlayerAppearance:
			return `Set player appearance ${appearancePlayer(c.x, hold)}`;
		case ScriptCommandType.CC_SetPlayerBehavior:
			return `Set player behavior ${playerBehavior(c.x)} ${playerBehaviorState(c.y)}`;
		case ScriptCommandType.CC_SetPlayerState:
			return `Set player state ${playerState(c.y)} ${onOff(c.x)}`;
		case ScriptCommandType.CC_SetPlayerStealth:
			return `Set player stealth ${stealth(c.x)}`;
		case ScriptCommandType.CC_SetPlayerWeapon:
			return `Set player weapon ${weapon(c.x)}`;
		case ScriptCommandType.CC_SetWaterTraversal:
			return `Set water traversal ${waterTraversal(c.x)}`;
		case ScriptCommandType.CC_SetWallLight:
			return `Set wall light ${lightColor(c.flags)}, ${c.w} ${xy(c)}`;
		case ScriptCommandType.CC_Speech:
			return !speech
				? "Speech ?"
				: join([
						`Speech "${speech.message.newValue ?? "?"}",`,
						`${speech.$mood},`,
						`${speech.$speaker},`,
						speech.character === Speaker.Custom ? `${xy(c)},` : "",
						`${speech.delay},`,
						speech.$data?.name.newValue ?? ".",
					]);
		case ScriptCommandType.CC_StartGlobalScript:
			return `Start global script ${context.hold.characters.get(c.x)?.name.newValue ?? "?"}`;
		case ScriptCommandType.CC_TeleportPlayerTo:
			return `Teleport player to ${xy(c)}`;
		case ScriptCommandType.CC_TeleportTo:
			return `Teleport to ${xy(c)}`;
		case ScriptCommandType.CC_TurnIntoMonster:
			return `Turn into monster`;
		case ScriptCommandType.CC_VarSet:
			return TextUtils.varSet(c, context);
		case ScriptCommandType.CC_VarSetAt:
			return TextUtils.varSetAt(c, context);
		case ScriptCommandType.CC_Wait:
			return `Wait ${c.x}`;
		case ScriptCommandType.CC_WaitForArrayEntry:
			return TextUtils.waitForArrayEntry(c, context);
		case ScriptCommandType.CC_WaitForBrainSense:
			return `Wait for brain sensing player`;
		case ScriptCommandType.CC_WaitForBuilding:
			return `Wait for building marker at ${xywh(c)}`;
		case ScriptCommandType.CC_WaitForBuildType:
			return `Wait for building marker type ${tile(c.flags)} at ${xywh(c)}`;
		case ScriptCommandType.CC_WaitForCleanLevel:
			return `Wait for clean level`;
		case ScriptCommandType.CC_WaitForCleanRoom:
			return `Wait for clean room`;
		case ScriptCommandType.CC_WaitForCueEvent:
			return `Wait for event ${event(c.x)}`;
		case ScriptCommandType.CC_WaitForDoorTo:
			return `Wait for door to ${openClose(c.w)},${xy(c)}`;
		case ScriptCommandType.CC_WaitForEntityType:
			return `Wait for entity type ${appearanceMonster(c.flags, hold)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForExpression:
			return `Wait until expression ${c.label} ${scriptVarComp(c.y)} ${c.x}`;
		case ScriptCommandType.CC_WaitForItem:
			return `Wait for item ${tile(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForItemGroup:
			return `Wait for item group ${tileGroup(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForNoBuilding:
			return `Wait for no building marker ${xywh(c)}`;
		case ScriptCommandType.CC_WaitForNotItemGroup:
			return `Wait while item group ${tileGroup(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForNotBuildType:
			return `Wait until building marker type ${tile(c.flags)} at ${xywh(c)}`;
		case ScriptCommandType.CC_WaitForNotEntityType:
			return `Wait while entity type ${appearanceMonster(c.flags, hold)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForNotRect:
			return `Wait while entity ${waitFlags(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForOpenMove:
			return `Wait for open move ${dir(c.x)}`;
		case ScriptCommandType.CC_WaitForOpenTile:
			return TextUtils.waitForOpenTile(c);
		case ScriptCommandType.CC_WaitForPlayerInput:
			return `Wait for player input ${input(c.x)}`;
		case ScriptCommandType.CC_WaitForPlayerState:
			return `Wait for player state ${playerState(c.y)} ${onOff(c.x)}`;
		case ScriptCommandType.CC_WaitForPlayerToFace:
			return `Wait for player to face ${dir(c.x)}`;
		case ScriptCommandType.CC_WaitForPlayerToMove:
			return `Wait for player to move ${dir(c.x)}`;
		case ScriptCommandType.CC_WaitForPlayerToTouchMe:
			return `Wait for player to touch me`;
		case ScriptCommandType.CC_WaitForRemains:
			return `Wait for remains ${monster(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForRect:
			return `Wait for entity ${waitFlags(c.flags)},${xywh(c)}`;
		case ScriptCommandType.CC_WaitForSomeoneToPushMe:
			return `Wait for someone to push me`;
		case ScriptCommandType.CC_WaitForTurn:
			return `Wait for turn ${c.x}`;
		case ScriptCommandType.CC_WaitForVar:
			return TextUtils.waitForVar(c, context);
		case ScriptCommandType.CC_WaitForWeapon:
			return `Wait for weapon ${weaponFlags(c.flags)} ${xywh(c)}`;
		case ScriptCommandType.CC_WorldMapIcon:
			return `World map icon ${appearanceMonster(c.h, hold)},${worldMapIcon(c.flags)},${xy(c)},${c.w}`;
		case ScriptCommandType.CC_WorldMapImage:
			return `World map image ${c.h},${worldMapIcon(c.flags)},${xy(c)},${c.w}`;
		case ScriptCommandType.CC_WorldMapMusic:
			return `World map music ${music(c)}`;
		case ScriptCommandType.CC_WorldMapSelect:
			return `World map select ${c.x}`;

		case ScriptCommandType.CC_GotoIf:
			return `[DEPRECATED - CC_GotoIf]`;
		case ScriptCommandType.CC_WaitForCharacter:
			return `[DEPRECATED - CC_WaitForCharacter]`;
		case ScriptCommandType.CC_WaitForHalph:
			return `[DEPRECATED - CC_WaitForHalph]`;
		case ScriptCommandType.CC_WaitForMonster:
			return `[DEPRECATED - CC_WaitForMonster]`;
		case ScriptCommandType.CC_WaitForNotCharacter:
			return `[DEPRECATED - CC_WaitForNotCharacter]`;
		case ScriptCommandType.CC_WaitForNotHalph:
			return `[DEPRECATED - CC_WaitForNotHalph]`;
		case ScriptCommandType.CC_WaitForNotMonster:
			return `[DEPRECATED - CC_WaitForNotMonster]`;
		default:
			shouldBeUnreachable(c.type);
			return "";
	}
}

export function getHoldCommandsExport(hold: Hold) {
	const blobs: string[] = [];
	for (const c of hold.characters.values()) {
		blobs.push(
			`Custom Character ${c.name.newValue}:\n${getCommandsToString(c.$commandList, 1)}`,
		);
	}
	for (const room of hold.rooms.values()) {
		for (const monster of room.monsters) {
			if (monster.$commandList) {
				blobs.push(
					`${room.$level.name.newValue}: ${room.$coordsName}`
						+ ` at (${monster.x}, ${monster.y})`
						+ ` of ${getCharacterName(hold, monster.$characterTypeId)}`
						+ `\n${getCommandsToString(monster.$commandList, 1)}`,
				);
			}
		}
	}

	return blobs.join("\n\n");
}

export function getFormatName(type: DataFormat): string {
	return DataFormatToName.get(type) ?? `Wrong Format[${type}]`;
}

export function getShowDescriptionName(type: number): string {
	switch (type) {
		case 0:
			return "Not Displayed";
		case 1:
			return "Always";
		case 2:
			return "Once";
		default:
			return `Unknown Type ${type}`;
	}
}

export function getSpeakerMood(mood: number): string {
	return MoodToName.get(mood) ?? "Unknown";
}

export function filterDataFormat(
	format: DataFormat | undefined,
	filter: string,
): boolean {
	switch (filter) {
		case "none":
			return format === undefined;
		case "unknown":
			return (
				format === DataFormat.Unknown
				|| (!!format && !DataFormatToName.has(format))
			);
		case "img":
			return (
				format === DataFormat.BMP
				|| format === DataFormat.JPG
				|| format === DataFormat.PNG
			);
		case "sfx":
			return (
				format === DataFormat.S3M
				|| format === DataFormat.WAV
				|| format === DataFormat.OGG
			);
		case "other":
			return (
				!!format
				&& format !== DataFormat.BMP
				&& format !== DataFormat.JPG
				&& format !== DataFormat.PNG
				&& format !== DataFormat.S3M
				&& format !== DataFormat.WAV
				&& format !== DataFormat.OGG
			);
		case "":
			return true;

		default:
			return !!format && format.toString() === filter;
	}
}

export function getDataFormatFilterOptions(): OptGroup[] {
	return [
		{
			label: "Separate",
			options: [
				{ id: "none", value: "none", label: "None" },
				{ id: "bmp", value: DataFormat.BMP.toString(), label: "BMP" },
				{ id: "jpg", value: DataFormat.JPG.toString(), label: "JPG" },
				{ id: "png", value: DataFormat.PNG.toString(), label: "PNG" },
				{ id: "s3m", value: DataFormat.S3M.toString(), label: "S3M" },
				{ id: "wav", value: DataFormat.WAV.toString(), label: "WAV" },
				{ id: "ogg", value: DataFormat.OGG.toString(), label: "OGG" },
				{ id: "ttf", value: DataFormat.TTF.toString(), label: "TTF" },
				{ id: "theora", value: DataFormat.THEORA.toString(), label: "THEORA" },
				{ id: "unknown", value: "unknown", label: "Unknown" },
			],
		},
		{
			label: "Grouped",
			options: [
				{ id: "img", label: "Image", value: "img" },
				{ id: "sound", label: "Sound", value: `sfx` },
				{ id: "other", label: "Other", value: `other` },
			],
		},
	];
}

export function canPreviewData(details: HoldDataDetails) {
	return (
		details.format === DataFormat.BMP
		|| details.format === DataFormat.PNG
		|| details.format === DataFormat.JPG
		|| details.format === DataFormat.OGG
		|| details.format === DataFormat.WAV
	);
}

export function getBase64DecodedLength(data: string) {
	if (data.length === 0) {
		return 0;
	}

	const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;

	return (3 * data.length - 4 * padding) / 4;
}

export function isImageFormat(format: DataFormat) {
	return (
		format === DataFormat.BMP
		|| format === DataFormat.JPG
		|| format === DataFormat.PNG
	);
}

export function isAudioFormat(format: DataFormat) {
	return (
		format === DataFormat.S3M
		|| format === DataFormat.OGG
		|| format === DataFormat.WAV
	);
}
