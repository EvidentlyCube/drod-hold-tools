import {createNullPlayer, Player} from "./Player";
import {Entrance} from "./Entrance";
import {Var} from "./Var";
import {Character} from "./Character";
import {Data} from "./Data";
import {Speech} from "./Speech";
import {Level} from "./Level";
import {Room} from "./Room";
import {WorldMap} from "./WorldMap";
import {Change} from "./Change";
import {ModelType} from "../common/Enums";
import {Scroll} from "./Scroll";

export interface Hold {
	isLoaded: boolean;
	modelType: ModelType.Hold;
	xmlDocument: XMLDocument;
	xmlDrod: Element;
	xml: Element;

	name: string;
	description: string;
	ending: string;
	playerId: number;
	dateCreated: Date;
	dateUpdated: Date;

	author: Player;
	characters: Map<number, Character>;
	datas: Map<number, Data>;
	entrances: Map<number, Entrance>;
	levels: Map<number, Level>;
	players: Map<number, Player>;
	rooms: Map<number, Room>;
	scrolls: Map<string, Scroll>;
	speeches: Map<number, Speech>;
	worldMaps: Map<number, WorldMap>;
	vars: Map<number, Var>;

	counts: {
		scrolls: number,
		monsters: number,
		characters: number
	}

	changes: {
		name?: string,
		description?: string,
		ending?: string
	}
	dataChanges: Set<Change>;
}

export function createNullHold(): Hold {
	return {
		isLoaded: false,
		modelType: ModelType.Hold,
		xmlDocument: document.implementation.createDocument(null, null),
		xmlDrod: document.createElement('drod'),
		xml: document.createElement('Holds'),

		name: '',
		description: '',
		ending: '',
		playerId: 0,
		dateCreated: new Date(),
		dateUpdated: new Date(),

		author: createNullPlayer(),
		characters: new Map(),
		datas: new Map(),
		entrances: new Map(),
		levels: new Map(),
		players: new Map(),
		rooms: new Map(),
		scrolls: new Map(),
		speeches: new Map(),
		worldMaps: new Map(),
		vars: new Map(),

		counts: {
			characters: 0,
			monsters: 0,
			scrolls: 0,
		},

		changes: {},
		dataChanges: new Set(),
	};
}