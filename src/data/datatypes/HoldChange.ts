import { areObjectsSame } from "../../utils/ObjectUtils";
import { SignalSet } from "../../utils/SignalSet";
import { Signal } from "../../utils/Signals";
import { HoldDataDetails } from "./HoldData";

export enum HoldChangeType {
	SpeechMessage = 0,
	DataName = 1,
	DataFile = 2,
	LevelName = 3,
	CharacterName = 4,
	EntranceDescription = 5,
	ScrollMessage = 6,
	EntranceShowDescription = 7,
	SpeechMood = 8,
	SpeechDataId = 9,
	EntranceDataId = 10,
	WorldMapName = 11,
	CharacterAvatarDataId = 12,
	CharacterTilesDataId = 13,
}

export type HoldChangeCharacterAvatarDataId = {
	type: HoldChangeType.CharacterAvatarDataId,
	location: { characterId: number };

	hasChange: boolean;
	value?: number;
}

export type HoldChangeCharacterName = {
	type: HoldChangeType.CharacterName,
	location: { characterId: number };

	hasChange: boolean;
	value: string;
}

export type HoldChangeCharacterTilesDataId = {
	type: HoldChangeType.CharacterTilesDataId,
	location: { characterId: number };

	hasChange: boolean;
	value?: number;
}

export type HoldChangeDataName = {
	type: HoldChangeType.DataName,
	location: { dataId: number };

	hasChange: boolean;
	value: string;
}

export type HoldChangeDataFile = {
	type: HoldChangeType.DataFile,
	location: { dataId: number };

	hasChange: boolean;
	value: HoldDataDetails;
}

export type HoldChangeEntranceDataId = {
	type: HoldChangeType.EntranceDataId,
	location: { entranceId: number };

	hasChange: boolean;
	value?: number;
}

export type HoldChangeEntranceDescription = {
	type: HoldChangeType.EntranceDescription,
	location: { entranceId: number };

	hasChange: boolean;
	value: string;
}

export type HoldChangeEntranceShowDescription = {
	type: HoldChangeType.EntranceShowDescription,
	location: { entranceId: number };

	hasChange: boolean;
	value: number;
}

export type HoldChangeLevelName = {
	type: HoldChangeType.LevelName,
	location: { levelId: number };

	hasChange: boolean;
	value: string;
}

export interface HoldChangeSpeechDataId {
	type: HoldChangeType.SpeechDataId;
	location: { speechId: number };

	hasChange: boolean;
	value?: number;
}

export interface HoldChangeSpeechMessage {
	type: HoldChangeType.SpeechMessage;
	location: { speechId: number };

	hasChange: boolean;
	value: string;
}

export interface HoldChangeSpeechMood {
	type: HoldChangeType.SpeechMood;
	location: { speechId: number };

	hasChange: boolean;
	value: number;
}

export interface HoldChangeScrollMessage {
	type: HoldChangeType.ScrollMessage;
	location: { roomId: number, x: number, y: number };

	hasChange: boolean;
	value: string;
}

export interface HoldChangeWorldMapName {
	type: HoldChangeType.WorldMapName;
	location: { worldMapId: number };

	hasChange: boolean;
	value: string;
}

export type HoldChange = HoldChangeCharacterAvatarDataId
	| HoldChangeCharacterName
	| HoldChangeCharacterTilesDataId
	| HoldChangeDataName
	| HoldChangeDataFile
	| HoldChangeEntranceDataId
	| HoldChangeEntranceDescription
	| HoldChangeEntranceShowDescription
	| HoldChangeLevelName
	| HoldChangeScrollMessage
	| HoldChangeSpeechDataId
	| HoldChangeSpeechMessage
	| HoldChangeSpeechMood
	| HoldChangeWorldMapName

function match(left: HoldChange, right: HoldChange) {
	return left.type === right.type && areObjectsSame(left.location, right.location);
}

export class HoldChangeList {
	public readonly list = new SignalSet<HoldChange>();
	public readonly onChange = new Signal<HoldChange>();

	public loadStored(changes: HoldChange[]) {
		changes.forEach(change => this.list.add(change));
	}

	public add(change: HoldChange) {
		this.list.add(change);
		this.onChange.dispatch(change);
	}

	public del(change: HoldChange) {
		this.list.delete(change);
		this.onChange.dispatch(change);
	}

	public create<T extends HoldChange>(change: T): T {
		return (this.list.find(stored => match(stored, change)) ?? change) as T;
	}

	public toJson() {
		return JSON.stringify(this.list.values());
	}

}