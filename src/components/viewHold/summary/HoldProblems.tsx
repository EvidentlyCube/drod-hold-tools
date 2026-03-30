import type { Hold } from "../../../data/datatypes/Hold";
import HoldRefView from "../HoldRefView";

interface Props {
	hold: Hold;
}

export default function HoldProblems({ hold }: Props) {
	if (hold.$problems.length === 0) {
		return <>No problems detected.</>;
	}

	return (
		<ul>
			{hold.$problems.map(problem => {
				return (
					<li key={problem.id}>
						<strong>{problem.problem}</strong>
						<br />
						<em>
							at <HoldRefView holdRef={problem.ref} />
						</em>
					</li>
				);
			})}
		</ul>
	);
}
