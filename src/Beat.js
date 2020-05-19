import React from 'react';
import Draggable from 'react-draggable';

const Beat = (props) => {
    let notes = [];
    let noteHeight = props.height / props.numNotes;
    for (let i = 0; i < props.numNotes; i++) {
        notes.push(
            <div
                key={i}
                className="note"
                style={{ width: props.width, height: noteHeight }} />
        )
    }

    let activeNote = <Draggable
        axis="y"
        grid={[noteHeight, noteHeight]}
        bounds="parent"
        onStop={(e) => {props.moveCallback(e.clientY)}}>
        <div
            className="note active"
            style={{
                width: props.width,
                height: noteHeight,
                position: "absolute",
                top: noteHeight * props.initialNote || 0
            }}
        />
    </Draggable>;

    return (
        <div className="beat">
            {notes}
            {activeNote}
        </div>
    );
}

export default Beat;