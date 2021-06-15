import { CircularProgress, Modal } from "@material-ui/core"
import React from "react";

const style: React.CSSProperties = {
    left: 'calc(50% - 10vmin)',
    top: 'calc(50% - 10vmin)',
    color: 'white',
    width: '20vmin',
    height: '20vmin',
    position: 'absolute'
}

export const IsBusyModal = ({open}: {open: boolean}) => {
    return <Modal open={open}>
        <CircularProgress style={style} />
    </Modal>;
}