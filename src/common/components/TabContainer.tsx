import { Box, Container } from "@material-ui/core";
import React from "react";

type TabContainerProps = React.PropsWithChildren<{
	value: any,
	index: any,
	className: string
}>;

export const TabContainer = (props: TabContainerProps) => {
	const {children, value, index, className} = props;

	if (value !== index) {
		return null;
	}

	return (
		<Container
			className={className}
			role="tabpanel"
			maxWidth="xl"
		>
			<Box>{children}</Box>
		</Container>
	);
}