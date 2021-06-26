import {Data, DataFormat} from "../../data/Data";
import { Hold } from "../../data/Hold";
import { Store } from "../../data/Store";
import HoldUploader from "../../tabs/holdTab/HoldUploader";
import { HoldUtils } from "../HoldUtils";
import { UpdateUtils } from "../UpdateUtils";
import {DataUtils} from "../DataUtils";

interface DataUploadResult {
	data?: string;
	format?: DataFormat;
	error: string;
}

const MatchFileName = /^.+\.(ogg|wav|png|jpe?g|bmp)$/i

export const DataUploader = {
	async uploadFile(file: File, data: Data, hold: Hold): Promise<DataUploadResult> {
		return new Promise(resolve => {
			const fileNameMatches = file.name.match(MatchFileName);
			if (!fileNameMatches) {
				return {error: 'Unsupported file type'};
			} else if (file.size > 16 * 1024 * 1024) {
				return {error: 'Max file size is 16mb'};
			}

			const [, extension] = fileNameMatches;
			const newFileFormat = DataUtils.extensionToFormat(extension);
			if (!DataUtils.isAudio(data.format) && !DataUtils.isAudio(newFileFormat)) {
				return {error: 'Audio can only be replaced with another audio (either OGG or WAV)'};
			} else if (!DataUtils.isImage(data.format) && !DataUtils.isImage(newFileFormat)) {
				return {error: 'Image can only be replaced with another image (PNG, BMP or JPG)'};
			}

			Store.isBusy.value = true;

			const fileReader = new FileReader();
			fileReader.onload = async () => {
				const commaIndex = (fileReader.result as string).indexOf(',');
				const fileData = (fileReader.result as string).substr(commaIndex + 1);

				UpdateUtils.dataData(data, fileData, hold);
				UpdateUtils.dataFormat(data, newFileFormat, hold);

				Store.isBusy.value = false;

				resolve({
					data: fileData,
					format: newFileFormat,
					error: ''
				});
			};
			fileReader.readAsDataURL(file);
		});
	}
}