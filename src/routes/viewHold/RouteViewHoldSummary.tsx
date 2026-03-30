import { ReactElement, useCallback } from "react";
import { useParams } from "react-router-dom";
import TextImportButton from "../../components/viewHold/actions/TextsImportButton";
import TextsExportButton from "../../components/viewHold/actions/TextsExportButton";
import { PlayerRefViewByIdDynamic } from "../../components/viewHold/PlayerRefView";
import SwapPlayerButton from "../../components/viewHold/preview/SwapPlayerButton";
import HoldProblems from "../../components/viewHold/summary/HoldProblems";
import { Hold } from "../../data/datatypes/Hold";
import { getHoldCommandsExport } from "../../data/Utils";
import { HoldReaders } from "../../processor/HoldReaders";

type GetData = (hold: Hold) => ReactElement[] | ReactElement | string | number;

const DataPoints: Record<string, GetData> = {
	"Version": hold => hold.version.toString(),
	"Name": hold => hold.name.oldValue,
	"Author": hold => <div className="is-flex is-gap-1 is-align-items-center">
		<SwapPlayerButton hold={hold} playerSource={hold.playerId} />
		<PlayerRefViewByIdDynamic hold={hold} playerIdSource={hold.playerId} />
	</div>,
	"Description": hold => hold.descriptionMessage.oldValue,
	"Levels No.": hold => hold.levels.size,
	"Rooms No.": hold => hold.rooms.size,
	"Datas No.": hold => hold.datas.size,
	"Character No.": hold => hold.characters.size,
}

export default function RouteViewHoldSummary() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);
	const handleDownloadScripts = useCallback(() => {
		void navigator.clipboard.writeText(getHoldCommandsExport(hold));
		alert("Copied!");
	}, [hold]);

	return (
		<table className="table is-fullwidth is-hoverable is-striped">
			<tbody>
				{Object.entries(DataPoints).map(([name, getData]) => <DataRow key={name} hold={hold} name={name} getData={getData} />)}
				<tr>
					<th>Actions</th>
					<td>
						<div className="buttons section p-4 mb-0">
							<button className="button ml-3 is-primary" title="Download scripts" onClick={handleDownloadScripts}>
								Copy all scripts to clipboard
							</button>
							<TextsExportButton hold={hold} />
							<TextImportButton hold={hold} />
						</div>
					</td>
				</tr>
				<tr>
					<th>Problems:</th>
					<td className="content"><HoldProblems hold={hold} /></td>
				</tr>
			</tbody>
		</table>
	);
}

interface Props {
	name: string;
	getData: GetData;
	hold: Hold;
}
function DataRow({ name, getData, hold }: Props) {
	return <tr>
		<th>{name}</th>
		<td>{getData(hold)}</td>
	</tr>
}