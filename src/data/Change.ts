import {Speech} from "./Speech";

interface SpeechChange {
	type: "Speech";
	model: Speech;
}

export type Change = SpeechChange;