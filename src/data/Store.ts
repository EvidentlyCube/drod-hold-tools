import {ObservableProperty} from "../common/ObservableProperty";
import {createNullHold, Hold} from "./Hold";
import {HoldDecoder} from "../holdDecoder/HoldDecoder";

import AutoUploadHold from '../assets/auto-upload-hold.hold';

export const Store = {
	loadedHold: new ObservableProperty<Hold>(createNullHold()),
	holdDecoder: new HoldDecoder(),
};

fetch(AutoUploadHold).then(x => {
	return x.blob();
}).then(blob => {
	return blob.arrayBuffer();
}).then(buffer => {
	Store.holdDecoder.startDecode(new Uint8Array(buffer), "auto-upload-hold.hold");
});
