import { ChangeEvent, useCallback } from "react";
import { parseFileToDataDetail } from "../../../data/actions/parseFileToDataDetail";
import { HoldData } from "../../../data/datatypes/HoldData";
import { useSignalNullable } from "../../../hooks/useSignalNullable";

interface Props {
	data: HoldData;
}
export default function ReplaceButton({ data }: Props) {
	const file = useSignalNullable(data.$replacingFile);

	const onFileSelected = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files ? e.target.files[0] : null;

		if (!file) {
			return;
		}

		data.$replacingFile.value = file;

		parseFileToDataDetail(data, file)
			.then(detail => {
				data.$replacingFile.unset();
				data.$lastReplaceError.unset();
				data.details.newValue = detail;
			})
			.catch(error => {
				data.$replacingFile.unset();
				data.$lastReplaceError.value = String(error);
			})

	}, [data]);

	return <>
		<div className={`file has-name is-warning mb-1 ${file ? 'is-disabled' : ''}`}>
			<label className="file-label">
				<input className="file-input" type="file" onChange={onFileSelected} disabled={!!file} />
				<span className="file-cta">
					{!file &&
						<span className="file-icon">
							<i className="fas fa-upload"></i>
						</span>
					}
					<span className="file-label is-readonly">
						{file && <div className="loader is-spinner-black"></div>}
						{!file && "Replace data"}
					</span>
				</span>
				<span className="file-name">{file?.name ?? "No file selected"}</span>
			</label>
		</div>
		<ErrorMessage data={ data } />
	</>
}

function ErrorMessage({ data }: Props) {
	const lastError = useSignalNullable(data.$lastReplaceError);

	const clearMessage = useCallback(() => data.$lastReplaceError.unset(), [data]);

	if (!lastError) {
		return null;
	}

	return <article className="message is-danger is-small">
		<div className="message-body is-flex is-align-items-center is-gap-1 p-1 pl-2">
			<button className="delete is-small is-float-right" onClick={clearMessage}></button>
			<p>{lastError}</p>
		</div>
	</article>;
}