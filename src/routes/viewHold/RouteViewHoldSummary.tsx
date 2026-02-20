import { useParams } from "react-router-dom";
import { HoldReaders } from "../../processor/HoldReaders";
import { Hold } from "../../data/datatypes/Hold";
import { ReactElement, useCallback, useMemo } from "react";
import SwapPlayerButton from "../../components/viewHold/preview/SwapPlayerButton";
import { PlayerRefViewByIdDynamic } from "../../components/viewHold/PlayerRefView";
import { getCharacterName, getCommandsToString } from "../../data/Utils";
import { Zippable, zipSync } from 'fflate';
import { base64ToUint8 } from "../../utils/StringUtils";
import HoldProblems from "../../components/viewHold/summary/HoldProblems";

type GetData = (hold: Hold) => ReactElement[] | ReactElement | string | number;

const DataPoints: Record<string, GetData> = {
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
		const blobs: string[] = [];
		for (const c of hold.characters.values()) {
			blobs.push(`Custom Character ${c.name.newValue}:\n${getCommandsToString(c.$commandList)}`);
		}
		for (const room of hold.rooms.values()) {
			for (const monster of room.monsters) {
				if (monster.$commandList) {
					blobs.push(
						`${room.$level.name.newValue}: ${room.$coordsName}`
						+ ` at (${monster.x}, ${monster.y})`
						+ ` of ${getCharacterName(hold, monster.$characterTypeId)}`
						+ `\n${getCommandsToString(monster.$commandList)}`
					);
				}
			}
		}

		navigator.clipboard.writeText(blobs.join("\n\n"));
		alert("Copied!");

	}, [hold]);
	const handleDownloadData = useCallback(() => {
		const z = {} as Zippable;

		for (const data of hold.datas.values()) {
			z[data.name.newValue] = base64ToUint8(data.details.newValue.rawEncodedData);
		}

		const zip = zipSync(z);

		// Create a blob from the zip bytes and trigger a download
		const blob = new Blob([zip], { type: 'application/zip' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// sanitize filename: allow common safe characters
		const safeName = (hold.name && hold.name.newValue)
			? String(hold.name.newValue).replace(/[^\w\-_. ]+/g, '')
			: 'hold-data';
		a.download = `${safeName}.zip`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);

	}, [hold]);

	const handleDeleteAllUnusedData = useCallback(() => {
		for (const data of hold.datas.values()) {
			if (data.$uses.length === 0) {
				data.$isDeleted.newValue = true;
			}
		}
	}, [hold]);

	const handleDeleteAllUnusedSpeech = useCallback(() => {
		for (const speech of hold.speeches.values()) {
			if (speech.$canDelete) {
				speech.$isDeleted.newValue = true;
			}
		}
	}, [hold]);

	return (
		<table className="table is-fullwidth is-hoverable is-striped">
			<tbody>
				{Object.entries(DataPoints).map(([name, getData]) => <DataRow key={name} hold={hold} name={name} getData={getData} />)}
				<tr>
					<th>Actions</th>
					<td>
						<button className="button ml-3 is-primary" title="Download scripts" onClick={handleDownloadScripts}>
							Download all Scripts
						</button>
						<button className="button ml-3 is-primary" title="Download data" onClick={handleDownloadData}>
							Download all Data
						</button>
						<button className="button ml-3 is-primary" title="Delete all unused data" onClick={handleDeleteAllUnusedData}>
							Delete all unused Data
						</button>
						<button className="button ml-3 is-primary" title="Delete all unusable speeches" onClick={handleDeleteAllUnusedSpeech}>
							Delete all unusable Speeches
						</button>
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