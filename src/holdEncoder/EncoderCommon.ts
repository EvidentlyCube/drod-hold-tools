import {Hold} from "../data/Hold";

export interface EncodeState {
	hold: Hold;
	holdXml: XMLDocument;
	holdBytes: Uint8Array;
	holdBlob: Blob;
	progressFactor: number;
}

export interface EncodeStep {
	name: string;

	run(state: EncodeState): boolean;

	after?: (state: EncodeState) => void;
}