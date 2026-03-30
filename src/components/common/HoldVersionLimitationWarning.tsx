interface HoldVersionLimitationWarningProps {
	warnings: string[];
}

export function HoldVersionLimitationWarning({
	warnings,
}: HoldVersionLimitationWarningProps) {
	if (warnings.length === 0) {
		return null;
	}

	return (
		<article className="message is-warning m-4">
			<div className="message-header">
				<p>Limitations due to hold version</p>
			</div>
			<div className="message-body">
				<ul>
					{warnings.map(text => (
						<li key={text}>{text}</li>
					))}
				</ul>
			</div>
		</article>
	);
}
