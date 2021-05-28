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
	xml: Element;
	format: DataFormat;
	name: string;
}