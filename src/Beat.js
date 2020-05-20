import React from 'react';
import { DraggableCore } from 'react-draggable';

const Beat = (props) => {
    let notes = [];
    for (let i = 0; i < props.numNotes; i++) {
        notes.push(
            <div
                key={i}
                className="note"
                style={{ width: props.width, height: props.height }} />
        );
    }

    let activeNote = <DraggableCore
        axis="y"
        grid={[props.height, props.height]}
        bounds="parent"
        onDrag={(e) => props.moveCallback(e.clientY)}>
        <div
            className="note active"
            style={{
                width: props.width,
                height: props.height,
                position: "absolute",
                top: props.active * props.height
            }}
        />
    </DraggableCore>;

    return (
        <div className="beat">
            {notes}
            {activeNote}
        </div>
    );
}

export default Beat;