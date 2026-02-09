import { useParams } from "react-router-dom";
import { HoldReaders } from "../../processor/HoldReaders";
import { Hold } from "../../data/datatypes/Hold";
import { ReactElement, useCallback, useMemo } from "react";
import SwapPlayerButton from "../../components/viewHold/preview/SwapPlayerButton";
import { PlayerRefViewByIdDynamic } from "../../components/viewHold/PlayerRefView";
import { getCharacterName, getCommandsToString } from "../../data/Utils";

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
	const handleDownloadAll = useCallback(() => {
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

	return (
		<table className="table is-fullwidth is-hoverable is-striped">
			<tbody>
				{Object.entries(DataPoints).map(([name, getData]) => <DataRow key={name} hold={hold} name={name} getData={getData} />)}
				<tr>
					<th>Actions</th>
					<td>
						<button className="button ml-3 is-primary" title="Rollback changes" onClick={handleDownloadAll}>
							Download all Scripts
						</button>
					</td>
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