import { useCallback } from "react";
import { useSignalUpdatableValue } from "../../../hooks/useSignalUpdatableValue";
import { SignalUpdatableValue } from "../../../utils/SignalUpdatableValue";
import Select, { OptGroup, Option } from "../../common/Select";

interface Props<T> {
	value: SignalUpdatableValue<T>;
	options?: Option[];
	optGroups?: OptGroup[];
	transformer: (value: string) => T
}

export default function SelectEditor<T extends string|number>({ value, options, optGroups, transformer }: Props<T>) {
	const [, isEdited, newValue] = useSignalUpdatableValue(value);

	const onChange = useCallback((val: string) => {
		value.newValue = transformer(val);

		if (value.newValue === value.oldValue) {
			value.unset();
		}
	}, [value, transformer]);

	const onRollback = useCallback(() => {
		value.unset();
	}, [value]);

	return <div className="is-no-wrap">
		<Select
			className={isEdited ? 'is-warning' : ''}
			value={newValue.toString()}
			options={options}
			optgroups={optGroups}
			onChange={onChange} />
		{isEdited && <button className="button ml-3 is-warning" title="Rollback changes" onClick={onRollback}>
			<div className="icon">
				<i className="fas fa-rotate-left"></i>
			</div>
		</button>}
	</div>
}