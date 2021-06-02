import {ObservableProperty} from "../common/ObservableProperty";
import {createNullHold, Hold} from "./Hold";
import {HoldDecoder} from "../holdDecoder/HoldDecoder";

// import AutoUploadHold from '../assets/auto-upload-hold.hold';
// import AutoUploadHold from '../test/assets/DrodTouch.hold';
// import AutoUploadHold from '../test/assets/TheSecondSkyDemo.hold';
// import AutoUploadHold from '../test/assets/SpeechTest.hold';
import {HoldEncoder} from "../holdEncoder/HoldEncoder";

export const Store = {
	loadedHold: new ObservableProperty<Hold>(createNullHold()),
	downloadableHold: new ObservableProperty<undefined | Blob>(undefined),

	holdDecoder: new HoldDecoder(),
	holdEncoder: new HoldEncoder(),
};

// const autoLoad = true;
// const autoEncode = false;

// if (autoLoad) {
// 	fetch(AutoUploadHold).then(x => {
// 		return x.blob();
// 	}).then(blob => {
// 		return blob.arrayBuffer();
// 	}).then(buffer => {
// 		if (autoEncode) {
// 			const x = () => {
// 				Store.loadedHold.removeListener(x);
// 				Store.holdEncoder.startEncode(Store.loadedHold.value);
// 			};
// 			Store.loadedHold.addListener(x);
// 		}
// 		Store.holdDecoder.startDecode(new Uint8Array(buffer), "auto-upload-hold.hold");
// 	});
//
// }