import {ModelType} from "../common/Enums";
import {Room} from "./Room";
import {Command} from "./Command";
import {Speech} from "./Speech";
import {Character} from "./Character";
import {Entrance} from "./Entrance";

export enum DataFormat {
	BMP = 1,
	JPG = 2,
	PNG = 3,
	S3M = 20,
	WAV = 40,
	OGG = 41,
	THEORA = 70,
	Unknown = -1
}

export interface DataLink {
	model: Entrance | Room | Command | Speech | Character;
	field: 'dataId' | 'tilesDataId' | 'faceDataId' | 'w' | 'h' | 'y' | 'customImageDataId' | 'overheadImageDataId';
	description: string;
}

export interface Data {
	modelType: ModelType.Data;
	xml: Element;

	id: number;
	format: DataFormat;
	name: string;
	size: number;
	data: string;

	isNew: boolean;
	links: DataLink[];

	changes: {
		name?: string,
		data?: string,
		format?: DataFormat,
	}
}


export function createNullData(): Data {
	return {
		modelType: ModelType.Data,
		xml: document.createElement('Data'),

		id: 0,
		format: DataFormat.Unknown,
		name: '',
		size: 0,
		data: '',

		isNew: true,
		links: [],
		
		changes: {},
	};
}