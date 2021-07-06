import {Hold} from "../data/Hold";

export interface DecodeState {
	file?: File;
	holdBytes: Uint8Array;
	holdXml: XMLDocument;
	hold: Hold;
	progressFactor: number;
}

export interface DecodeStep {
	name: string;

	run(decoder: DecodeState): boolean;

	after?: (decoder: DecodeState) => void;
}