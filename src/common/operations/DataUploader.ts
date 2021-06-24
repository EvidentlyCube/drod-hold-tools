import { Data } from "../../data/Data";
import { Hold } from "../../data/Hold";
import { Store } from "../../data/Store";
import HoldUploader from "../../tabs/holdTab/HoldUploader";
import { HoldUtils } from "../HoldUtils";
import { UpdateUtils } from "../UpdateUtils";

interface DataUploadResult {
	data: string;
	error: string;
}

export const DataUploader = {
	async uploadFile(file: File, data: Data, hold: Hold, extensionRegexp: RegExp): Promise<DataUploadResult> {
		if (file.size > 16 * 1024 * 1024) {
			return {data: '', error: 'Max file size is 16mb'};
		} else if (!extensionRegexp.test(file.name)) {
			return {data: '', error: 'Unsupported file type'};
		}

		Store.isBusy.value = true;

		let res: (val: DataUploadResult) => void;
		const fileReader = new FileReader();
		fileReader.onload = async () => {
			const commaIndex = (fileReader.result as string).indexOf(',');
			const fileData = (fileReader.result as string).substr(commaIndex + 1);

			UpdateUtils.dataData(data, fileData, hold);

			Store.isBusy.value = false;
			
			res({
				data: fileData,
				error: ''
			});
		};
		fileReader.readAsDataURL(file);

		return new Promise(resolve => {
			res = resolve;
		});

	}
}