import React, { useState } from "react";
import Beat from './Beat';

const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const notes = [
    { name: "?", frequency: 0 },
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
    { name: "tie", frequency: 0 },
    { name: "rest", frequency: 0 }
];

const settings = {
    numNotes: notes.length,
    numBeats: 16,
    noteHeight: 20,
    noteWidth: 40,
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
    const [playing, setPlaying] = useState(false);
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
        setMelody(newMelody);
    }

    // initialize child beat elements
    let beats = [];
    for (let i = 0; i < settings.numBeats; i++) {
        beats.push(<Beat
            moveCallback={(y) => setNote(i, y)}
            key={i}
            active={melody[i]}
            activeName={notes[melody[i]].name}
            numNotes={settings.numNotes}
            height={settings.noteHeight}
            width={settings.noteWidth} />
        );
    }

    // play melody using web audio api
    const play = () => {
        if (!playing) {
            setPlaying(true);
            const playNote = (note, duration) => {
                if (note.name !== "tie") {
                    const osc = audioContext.createOscillator();
                    osc.type = 'sine';
                    let freq;
                    if (note.name === "?") {
                        freq = notes[randomInt(1, settings.numNotes - 2)].frequency;
                    } else {
                        freq = note.frequency;
                    }
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
                    osc.connect(audioContext.destination);
                    osc.start();
                    osc.stop(audioContext.currentTime + (duration - 1) / 1000);
                }
            };

            let counter = 0;
            playInterval = setInterval(() => {
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
        setPlaying(false);
        clearInterval(playInterval);
    };

    return (
        <div ref={pianoRollRef} id="app">
            {beats}
            {playing ?
                <button onClick={stop}>Stop</button> :
                <button onClick={play}>Play</button>}
        </div>
    );
};

export default App;