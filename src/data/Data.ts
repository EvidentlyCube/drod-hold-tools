import {ModelType} from "../common/Enums";

export enum DataFormat {
	BMP = 1,
	JPG = 2,
	PNG = 3,
	S3M = 20,
	WAV = 40,
	OGG = 41,
	THEORA = 70
}

export interface Data {
	modelType: ModelType.Data;
	xml: Element;

	id: number;
	format: DataFormat;
	name: string;
	size: number;

	changes: {
		name?: string
	},
	dataUrlCache?: string;
}