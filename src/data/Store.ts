import {ObservableProperty} from "../common/ObservableProperty";
import {createNullHold, Hold} from "./Hold";

export const Store = {
	loadedHold: new ObservableProperty<Hold>(createNullHold())
};