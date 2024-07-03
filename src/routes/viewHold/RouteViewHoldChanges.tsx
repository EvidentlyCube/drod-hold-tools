import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SortableTable from "../../components/common/sortableTable/SortableTable";
import { SortableTableColumn } from "../../components/common/sortableTable/SortableTableCommons";
import { useSignalArray } from "../../hooks/useSignalArray";
import { HoldExporter } from "../../processor/HoldExporter";
import { HoldReaders } from "../../processor/HoldReaders";
import { ChangeViewItem, changeToViewItem } from "./ChangeViewItem";
import HoldRefView from "../../components/viewHold/HoldRefVIew";

const Columns: SortableTableColumn<ChangeViewItem>[] = [
	{
		id: 'type',
		displayName: 'Type',
		widthPercent: 10,
		canHide: true,
		render: change => change.type
	},
	{
		id: 'location',
		displayName: 'Location',
		widthPercent: 10,
		canHide: true,
		render: change => <HoldRefView holdRef={change.location} />
	},
	{
		id: 'before',
		displayName: 'Before',
		widthPercent: 10,
		canHide: true,
		render: change => change.before
	},
	{
		id: 'after',
		displayName: 'After',
		widthPercent: 10,
		canHide: true,
		render: change => change.after
	},
];

export default function RouteViewHoldChanges() {
	const { holdReaderId } = useParams();
	const { hold } = HoldReaders.getParsed(holdReaderId);
	const exportingHolds = useSignalArray(HoldExporter.exportingHolds)
	const navigate = useNavigate();

	const isExporting = exportingHolds.includes(hold);
	const doExport = useCallback(() => {
		HoldExporter.exportHold(hold);

	}, [hold])

	const doDelete = useCallback(() => {
		if (window.confirm("Are you sure you want to delete this hold?")) {
			HoldReaders.deleteById(hold.$holdReaderId);
			navigate("/");
		}

	}, [hold, navigate]);

	const changes = hold.$changes.list.values().map(change => changeToViewItem(change, hold));

	return <>
		<div className="buttons section p-4 mb-0">
			<strong>Actions:</strong>
			<button
				className={isExporting ? "button is-primary is-loading" : "button is-primary"}
				onClick={doExport}
			>Export</button>
			<button
				className="button is-danger"
				onClick={doDelete}
			>Delete</button>
		</div>
		<SortableTable
			tableId="review-hold-changes"
			className="table is-fullwidth is-hoverable is-striped is-middle"
			columns={Columns}
			rows={changes}
			pageSize={25} />
	</>;
}