import React, { useState } from "react";
import Beat from './Beat';

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const arraysAreEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const notes = [
    { name: "?", frequency: 0, color: "#f35fd2" },
    { name: "E6", frequency: 1318.51, color: "#c336a0" },
    { name: "D6", frequency: 1174.66, color: "#d21e87" },
    { name: "C6", frequency: 1046.5, color: "#ce2310" },
    { name: "B5", frequency: 987.77, color: "#df5506" },
    { name: "A5", frequency: 880, color: "#eb6d04" },
    { name: "G5", frequency: 783.99, color: "#f5a306" },
    { name: "F5", frequency: 698.46, color: "#f1d009" },
    { name: "E5", frequency: 659.25, color: "#88db08" },
    { name: "D5", frequency: 587.33, color: "#0cc408" },
    { name: "C5", frequency: 523.25, color: "#30e2a0" },
    { name: "B4", frequency: 493.88, color: "#0fb8d9" },
    { name: "A4", frequency: 440, color: "#2689cf" },
    { name: "G4", frequency: 392.00, color: "#b428d4" },
    { name: "tie", frequency: 0, color: "#b063d5" },
    { name: "rest", frequency: 0, color: "#aeadae" }
];

const settings = {
    numNotes: notes.length,
    numBeats: 16,
    noteHeight: 30,
    noteWidth: 60,
    bpm: 200,
    get pianoRollHeight() {
        return this.noteHeight * this.numNotes;
    },
    get pianoRollWidth() {
        return this.noteWidth * this.numBeats;
    },
    get noteDuration() {
        return 60000 / this.bpm;
    }
};

// global audio context and oscillator
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// global interval variable
var playInterval;

const App = () => {
    const [playing, setPlaying] = useState(-1);
    const [melody, setMelody] = useState([
        8, 6, 3, 8, 7, 15, 4, 14, 3, 15, 0, 15, 10, 15, 15, 15
    ]);

    // need a reference to the piano roll container div
    // to calculate relative Y position when moving notes
    const pianoRollRef = React.createRef();

    // set melody[i] given mouse clientY
    const setNote = (i, y) => {
        // get Y relative to piano roll div
        const rect = pianoRollRef.current.getBoundingClientRect();
        let relativeY = y - rect.y;

        // normalize Y
        if (relativeY < 0) {
            relativeY = 0;
        } else if (relativeY >= settings.pianoRollHeight) {
            relativeY = settings.pianoRollHeight - 1;
        }

        // calculate and set note based on relative mouse Y
        let n = Math.floor((relativeY / settings.pianoRollHeight) * settings.numNotes);
        let newMelody = [...melody];
        newMelody[i] = n;

        // do nothing if all the notes are the same
        if (!arraysAreEqual(newMelody, melody)) {
            setMelody(newMelody);

            // preview new note
            playNote(notes[n], 130);
        }

    }

    // initialize child beat elements
    let beats = [];
    for (let i = 0; i < settings.numBeats; i++) {
        beats.push(<Beat
            moveCallback={(y) => setNote(i, y)}
            key={i}
            activeIndex={melody[i]}
            activeNote={notes[melody[i]]}
            currentlyPlaying={playing === i}
            numNotes={settings.numNotes}
            height={settings.noteHeight}
            width={settings.noteWidth} />
        );
    }

    const playNote = (note, duration) => {
        console.log(duration);
        if (note.name !== "tie") {
            // create gain node and ramp down at the end of note
            const gain = audioContext.createGain();
            gain.connect(audioContext.destination);
            let startTime = audioContext.currentTime;
            let endTime = startTime + (duration / 1000);
            gain.gain.setValueAtTime(1, endTime - .01);
            gain.gain.linearRampToValueAtTime(0, endTime);

            // create oscillator node and set frequency
            const osc = audioContext.createOscillator();
            osc.type = 'sine';
            let freq;
            if (note.name === "?") {
                let r = randomInt(1, settings.numNotes - 2);
                freq = notes[r].frequency;
            } else {
                freq = note.frequency;
            }
            osc.frequency.setValueAtTime(freq, startTime);

            // connect osc to gain and play note
            osc.connect(gain);
            osc.start();
            osc.stop(endTime);
        }
    };

    // play melody using web audio api
    const play = () => {
        if (playing === -1) {
            let counter = 0;
            playInterval = setInterval(() => {
                setPlaying(counter);
                if (counter >= melody.length) {
                    stop();
                } else {
                    let duration = settings.noteDuration;
                    if (notes[melody[counter]].name === "tie") {
                        duration = 0;
                    } else {
                        for (let i = counter + 1; i < melody.length; i++) {
                            if (notes[melody[i]].name === "tie") {
                                duration += settings.noteDuration;
                            } else {
                                break;
                            }
                        }
                    }
                    playNote(
                        notes[melody[counter]],
                        duration
                    );
                }
                counter++;
            }, settings.noteDuration);
        }
    };

    // clear interval and stop oscillator
    // note that playInterval and osc must be in global scope for this to work
    const stop = () => {
        setPlaying(-1);
        clearInterval(playInterval);
    };

    return (
        <div ref={pianoRollRef} id="app">
            {beats}
            <br />
            {playing === -1 ?
                <button onClick={play}>Play</button> :
                <button onClick={stop}>Stop</button>}
        </div>
    );
};

export default App;