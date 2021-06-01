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

export interface Hold {
	isLoaded: boolean;
	xmlDocument: XMLDocument;
	xmlData: Element;

	name: string;
	description: string;
	dateCreated: Date;
	dateUpdated: Date;

	author: Player;
	characters: Map<number, Character>;
	datas: Map<number, Data>;
	entrances: Map<number, Entrance>;
	levels: Map<number, Level>;
	rooms: Map<number, Room>;
	speeches: Map<number, Speech>;
	worldMaps: Map<number, WorldMap>;
	vars: Map<number, Var>;

	counts: {
		scrolls: number,
		monsters: number,
		characters: number
	}

	changes: Set<Change>;
}

export function createNullHold(): Hold {
	return {
		isLoaded: false,
		xmlDocument: document.implementation.createDocument(null, null),
		xmlData: document.createElement('Holds'),

		name: '',
		description: '',
		dateCreated: new Date(),
		dateUpdated: new Date(),

		author: createNullPlayer(),
		entrances: new Map(),
		vars: new Map(),
		characters: new Map(),
		datas: new Map(),
		speeches: new Map(),
		levels: new Map(),
		rooms: new Map(),
		worldMaps: new Map(),

		counts: {
			characters: 0,
			monsters: 0,
			scrolls: 0,
		},

		changes: new Set(),
	};
}