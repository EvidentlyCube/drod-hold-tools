import { useSignalUpdatableValue } from "../../hooks/useSignalUpdatableValue";
import type { SignalUpdatableValue } from "../../utils/SignalUpdatableValue";

interface Props {
	text: SignalUpdatableValue<string>;
}
export default function DrodTextView({ text }: Props) {
	const value = useSignalUpdatableValue(text, true);

	return <>{value}</>;
}
