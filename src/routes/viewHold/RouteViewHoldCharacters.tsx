import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldCharacter } from "../../data/datatypes/HoldCharacter";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareString, sortData } from "../../utils/SortUtils";
import { filterDataFormat, getDataFormatFilterOptions } from "../../data/Utils";
import SwapDataButton from "../../components/viewHold/preview/SwapDataButton";
import { DataFormat } from "../../data/DrodEnums";
import { DataRefViewByIdDynamic } from "../../components/viewHold/DataRefView";

const Columns: SortableTableColumn<HoldCharacter>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		canHide: true,

		render: character => character.id.toString(),
		sort: (isAsc, left, right) => isAsc ? left.id - right.id : right.id - left.id,
		filter: (character, filter) => filterString(character.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'type',
		displayName: 'Base Type',
		widthPercent: 10,
		render: character => character.$baseTypeName,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.$baseTypeName, r.$baseTypeName),
		filter: (character, filter) => filterString(character.$baseTypeName, filter),
		filterDebounce: 500,
	},
	{
		id: 'avatar',
		displayName: 'Avatar',
		widthPercent: 15,
		canHide: true,

		filterOptions: { optgroups: getDataFormatFilterOptions() },

		render: character => <div className="is-flex is-gap-1 is-align-items-center">
			<SwapDataButton hold={character.$hold} dataSource={character.avatarDataId} formats={[DataFormat.PNG, DataFormat.JPG, DataFormat.BMP]} />
			<DataRefViewByIdDynamic hold={character.$hold} dataIdSource={character.avatarDataId} showName={true} />
		</div>,
		sort: (isAsc, l, r) => sortData(isAsc, l.$avatarData, r.$avatarData),
		filter: (character, filter) => filterDataFormat(character.$avatarData?.details.newValue.format, filter)
	},
	{
		id: 'tiles',
		displayName: 'Tiles',
		widthPercent: 15,
		canHide: true,

		filterOptions: { optgroups: getDataFormatFilterOptions() },

		render: character => <div className="is-flex is-gap-1 is-align-items-center">
			<SwapDataButton hold={character.$hold} dataSource={character.tilesDataId} formats={[DataFormat.PNG, DataFormat.JPG, DataFormat.BMP]} />
			<DataRefViewByIdDynamic hold={character.$hold} dataIdSource={character.tilesDataId} showName={true} />
		</div>,
		sort: (isAsc, l, r) => sortData(isAsc, l.$avatarData, r.$avatarData),
		filter: (character, filter) => filterDataFormat(character.$avatarData?.details.newValue.format, filter)
	},
	{
		id: 'name',
		displayName: 'Name',
		widthPercent: 55,
		render: character => <DrodTextEditor text={character.name} />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.newValue, r.name.newValue),
		filter: (character, filter) => filterString(character.name.newValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldCharacters() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	return <>
		<SortableTable
			tableId={`characters::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={hold.characters.values()}
			pageSize={25} />
	</>
}