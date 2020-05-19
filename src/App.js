import React from "react";
import Beat from './Beat';

const notes = [
    { name: "E6", frequency: 1318.51 },
    { name: "D6", frequency: 1174.66 },
    { name: "C6", frequency: 1046.5 },
    { name: "B5", frequency: 987.77 },
    { name: "A5", frequency: 880 },
    { name: "G5", frequency: 783.99 },
    { name: "F5", frequency: 698.46 },
    { name: "E5", frequency: 659.25 },
    { name: "D5", frequency: 587.33 },
    { name: "C5", frequency: 523.25 },
    { name: "B4", frequency: 493.88 },
    { name: "A4", frequency: 440 },
    { name: "G4", frequency: 392.00 },
    { name: "rest", frequency: 0 }
];

const App = () => {
    const mainRef = React.createRef();
    const numNotes = 14;
    const numBeats = 16;
    const pianoRollHeight = 300;
    const beatWidth = 40;

    // default melody
    let melody = [
        11, 10, 9, 8, 10, 13, 12, 11, 11, 13, 13, 13, 13, 13, 13, 13
    ];

    // set melody[i] given mouse clientY
    const setNote = (i, y) => {
        // get Y relative to piano roll div
        const rect = mainRef.current.getBoundingClientRect();
        const relativeY = y - rect.y;

        // calculate and set note based on relative mouse Y
        let n = Math.floor((relativeY / pianoRollHeight) * numNotes);
        melody[i] = n;
    }

    // initialize child beat elements
    let beats = [];
    for (let i = 0; i < numBeats; i++) {
        beats.push(<Beat
            moveCallback={(y) => setNote(i, y)}
            key={i}
            numNotes={numNotes}
            initialNote={melody[i]}
            height={pianoRollHeight}
            width={beatWidth} />
        );
    }

    // play melody using web audio api
    const play = () => {
        const playNote = (freq, duration) => {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const osc = audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            osc.connect(audioContext.destination);
            osc.start();
            osc.stop(audioContext.currentTime + duration / 1000);
        }

        let counter = 0;
        let myInterval = setInterval(() => {
            playNote(notes[melody[counter]].frequency, 300);
            if (counter++ >= melody.length - 1) {
                clearInterval(myInterval);
            }
        }, 300);
    }

    return (
        <div ref={mainRef} id="app">
            {beats}
            <button onClick={play}>Play</button>
        </div>
    );
}

export default App;