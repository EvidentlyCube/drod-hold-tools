import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import DrodTextEditor from "../../components/viewHold/editables/DrodTextEditor";
import { HoldWorldMap } from "../../data/datatypes/HoldWorldMap";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString, sortData } from "../../utils/SortUtils";
import SwapDataButton from "../../components/viewHold/preview/SwapDataButton";
import { DataRefViewByIdDynamic } from "../../components/viewHold/DataRefView";
import { DataFormat } from "../../data/DrodEnums";
import { filterDataFormat } from "../../data/Utils";

const Columns: SortableTableColumn<HoldWorldMap>[] = [

	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 5,
		canHide: true,

		render: worldMap => worldMap.id,
		sort: (isAsc, left, right) => sortCompareNumber(isAsc, left.id, right.id),
		filter: (worldMap, filter) => filterString(worldMap.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'order-index',
		displayName: 'Order Index',
		widthPercent: 5,
		canHide: true,

		render: worldMap => worldMap.orderIndex,
		sort: (isAsc, left, right) => sortCompareNumber(isAsc, left.orderIndex, right.orderIndex),
		filter: (worldMap, filter) => filterString(worldMap.orderIndex.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'image',
		displayName: 'Image',
		widthPercent: 15,
		canHide: true,

		render: worldMap => <div className="is-flex is-gap-1 is-align-items-center">
			<SwapDataButton hold={worldMap.$hold} dataSource={worldMap.dataId} formats={[DataFormat.PNG, DataFormat.JPG, DataFormat.BMP]} />
			<DataRefViewByIdDynamic hold={worldMap.$hold} dataIdSource={worldMap.dataId} showName={true} />
		</div>,
		sort: (isAsc, l, r) => sortData(isAsc, l.$data, r.$data),
		filter: (worldMap, filter) => filterDataFormat(worldMap.$data?.details.newValue.format, filter)
	},
	{
		id: 'name',
		displayName: 'Name',
		widthPercent: 30,
		render: worldMap => <DrodTextEditor text={worldMap.name} tag="textarea" />,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.newValue, r.name.newValue),
		filter: (worldMap, filter) => filterString(worldMap.name.newValue, filter),
		filterDebounce: 500,
	}
];

export default function RouteViewHoldWorldMaps() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	return <>
		<SortableTable
			tableId={`world-maps::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={hold.worldMaps.values()}
			pageSize={25} />
	</>
}