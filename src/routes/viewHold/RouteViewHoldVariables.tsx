import { useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import { HoldVariable } from "../../data/datatypes/HoldVariable";
import { HoldReaders } from "../../processor/HoldReaders";
import { filterString, sortCompareNumber, sortCompareString } from "../../utils/SortUtils";
import VariableUsesPreviewButton from "../../components/viewHold/preview/VariableUsesPreviewButton";
import VariableRenameButton from "../../components/viewHold/editables/VariableRenameButton";
import DrodTextView from "../../components/viewHold/DrodTextView";

const Columns: SortableTableColumn<HoldVariable>[] = [
	{
		id: 'id',
		displayName: 'ID',
		widthPercent: 10,
		canHide: true,

		render: variable => variable.id,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.id, r.id),
		filter: (variable, filter) => filterString(variable.id.toString(), filter),
		filterDebounce: 500,
	},
	{
		id: 'name',
		displayName: 'Name',
		widthPercent: 30,
		render: variable => <DrodTextView text={variable.name}/>,
		sort: (isAsc, l, r) => sortCompareString(isAsc, l.name.newValue, r.name.newValue),
		filter: (variable, filter) => filterString(variable.name.newValue, filter),
		filterDebounce: 500,
	},
	{
		id: 'uses',
		displayName: 'Uses',
		widthPercent: 5,

		render: variable => <VariableUsesPreviewButton variable={variable} />,
		sort: (isAsc, l, r) => sortCompareNumber(isAsc, l.$uses.length, r.$uses.length),
	},
	{
		id: 'rename',
		displayName: 'Rename',
		widthPercent: 5,

		render: variable => <VariableRenameButton variable={variable} />,
	},
];

export default function RouteViewHoldVariables() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);

	return <>
		<SortableTable
			tableId={`variables::${hold.$holdReaderId}`}
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={hold.variables.values()}
			pageSize={25} />
	</>
}