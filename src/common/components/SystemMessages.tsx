import {Alert, AlertTitle, Snackbar} from "@material-ui/core";
import React, {useCallback, useEffect, useState} from "react";
import {Store} from "../../data/Store";
import {SystemMessage} from "../../data/SystemMessage";


export const SystemMessages = () => {
	const [message, setMessage] = useState(Store.systemMessage.value);

	const onSystemMessageChanged = useCallback((message?: SystemMessage) => {
		setMessage(message);
	}, [setMessage]);

	useEffect(() => {
		Store.systemMessage.addListener(onSystemMessageChanged);

		return () => {
			Store.systemMessage.removeListener(onSystemMessageChanged);
		};
	});

	if (!message) {
		return null;
	}

	return <Snackbar
		open={!!message}
		onClose={Store.popSystemMessage}
		anchorOrigin={{vertical: 'top', horizontal: 'center'}}
	>
		<Alert onClose={Store.popSystemMessage} severity={message.color}>
			<AlertTitle>{message.color.substr(0, 1).toUpperCase()}{message.color.substr(1)}</AlertTitle>
			{message.message}
		</Alert>
	</Snackbar>;
};