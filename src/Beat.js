import React from 'react';
import { DraggableCore } from 'react-draggable';

const brightenColor = (color, offset) => {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r += offset;
    g += offset;
    b += offset;

    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;

    return "#" + r.toString(16) + g.toString(16) + b.toString(16);

}

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
        onDrag={(e) => {
            if (e.type === "mousemove") {
                props.moveCallback(e.clientY)
            }
            if (e.type === "touchmove") {
                props.moveCallback(e.touches[0].clientY);
            }
        }}>
        <div
            className="note active"
            style={{
                width: props.width,
                height: props.height,
                lineHeight: props.height + "px",
                top: props.activeIndex * props.height,
                color: props.currentlyPlaying ?
                    "black" : "white",
                backgroundColor: props.currentlyPlaying ?
                    brightenColor(props.activeNote.color, 50) :
                    props.activeNote.color
            }}
        >{props.activeNote.name}</div>
    </DraggableCore>;

    return (
        <div className="beat">
            {notes}
            {activeNote}
        </div>
    );
}

export default Beat;