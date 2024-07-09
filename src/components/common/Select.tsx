import { ChangeEvent, useCallback } from "react";

type OptionArray = [string, string];
type OptionObject = { id?: string|number; value: string|number; label: string };
type OptionHr = ["hr"];
type OptionString = string;

export type Option = OptionArray | OptionObject | OptionHr | OptionString;
export interface OptGroup {
	id?: string;
	label: string;
	options: Option[];
}

type SelectProps = {
	className?: string;
	selectClassName?: string;
	emptyOption?: boolean|string;
	options?: Option[];
	optgroups?: OptGroup[];
	onChange?: (value: string) => void;
	value?: string;
	defaultValue?: string;
};

export default function Select(props: SelectProps) {
	const { className, selectClassName, options, optgroups, onChange, value, defaultValue, emptyOption } = props;

	const innerOnChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		onChange?.(e.currentTarget.value);
	}, [onChange]);

	return (
		<div className={`select ${className ?? ""} ${!value && emptyOption ? 'is-empty' : ''}`}>
			<select
				className={selectClassName}
				onChange={innerOnChange}
				value={value}
				defaultValue={defaultValue}
			>
				{emptyOption && <option value="">{emptyOption}</option>}
				{options && mapOptions(options)}
				{optgroups &&
					optgroups.map((optgroup, index) => (
						<OptionGroup
							key={getKey(optgroup, index)}
							label={optgroup.label}
							options={optgroup.options}
						/>
					))}
			</select>
		</div>
	);
}

interface OptionGroupProps {
	label: string;
	options: Option[];
}
function OptionGroup(props: OptionGroupProps) {
	const { label, options } = props;
	return <optgroup label={label}>{mapOptions(options)}</optgroup>;
}
interface OptionCompProps {
	option: Option;
}
function OptionComp(props: OptionCompProps) {
	const { option } = props;

	if (Array.isArray(option)) {
		if (option.length === 1) {
			if (option[0] === "hr") {
				return (
					<option className="is-select-separator" disabled></option>
				);
			} else {
				console.error(option);
				throw new Error("Invalid Option");
			}

		} else if (option.length === 2) {
			return <option value={option[0]}>{option[1]}</option>;
		} else {
			console.error(option);
			throw new Error("Invalid Option");
		}
	} else if (typeof option === "string") {
		return <option value={option}>{option}</option>;

	} else if (typeof option === "object") {
		return <option value={option.value}>{option.label}</option>;
	} else {
		console.error(option);
		throw new Error("Invalid Option");
	}
}

function mapOptions(options: Option[]) {
	return options.map((option, index) => (
		<OptionComp key={getKey(option, index)} option={option} />
	));
}

function getKey(source: Option | OptGroup, index: number) {
	if (typeof source === "object" && "id" in source && source.id) {
		return source.id;
	}

	return `${JSON.stringify(source)}::${index}`;
}
