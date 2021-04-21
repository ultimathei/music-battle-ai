/**
 * Returns a string associated to tha given note (in given octave)
 */
export const getNoteName = (noteIndex) => {
  let pitchName;
  switch (noteIndex % 12) {
    case 0:
      pitchName = "C";
      break;
    case 1:
      pitchName = "C#";
      break;
    case 2:
      pitchName = "D";
      break;
    case 3:
      pitchName = "D#";
      break;
    case 4:
      pitchName = "E";
      break;
    case 5:
      pitchName = "F";
      break;
    case 6:
      pitchName = "F#";
      break;
    case 7:
      pitchName = "G";
      break;
    case 8:
      pitchName = "G#";
      break;
    case 9:
      pitchName = "A";
      break;
    case 10:
      pitchName = "A#";
      break;
    case 11:
      pitchName = "B";
      break;
    default:
      pitchName = "missing";
      break;
  }
  let octaveIndex = Math.floor(noteIndex / 12) - 2;
  return pitchName + octaveIndex;
};

/**
 * Converts a note object to a single int value
 */
export const convertToPatternTime = (musicalTime) => {
  return (
    // musicalTime.pattern * 128 +
    musicalTime.bar * 32 + musicalTime.demisemi
  );
};

/**
 * Convert the pattern to magenta sample object
 * @param {*} pattern the recorder pattern to convert
 * @param {*} tempo bpm (or qpm)
 * @param {*} stepsPerQuarter numebr of steps in a beat
 * @returns the equivalent magenta object
 */
export const convertToMagentaSample = (pattern, tempo, stepsPerQuarter) => {
  const notes = pattern.map((note) => {
    let magentaNote = {
      'pitch': note.note,
      'quantizedStartStep': note.start,
      'quantizedEndStep': note.end
    };
    return magentaNote;
  });

  // notes = [
  //   { pitch: 60, quantizedStartStep: "0", quantizedEndStep: "2" },
  //   { pitch: 64, quantizedStartStep: "2", quantizedEndStep: "4" },
  //   { pitch: 60, quantizedStartStep: "4", quantizedEndStep: "6" },
  //   { pitch: 64, quantizedStartStep: "6", quantizedEndStep: "8" },
  //   { pitch: 67, quantizedStartStep: "8", quantizedEndStep: "12" },
  //   { pitch: 67, quantizedStartStep: "12", quantizedEndStep: "16" },
  //   { pitch: 60, quantizedStartStep: "16", quantizedEndStep: "18" },
  //   { pitch: 64, quantizedStartStep: "18", quantizedEndStep: "20" },
  //   { pitch: 60, quantizedStartStep: "20", quantizedEndStep: "22" },
  //   { pitch: 64, quantizedStartStep: "22", quantizedEndStep: "24" },
  //   { pitch: 67, quantizedStartStep: "24", quantizedEndStep: "28" },
  //   { pitch: 67, quantizedStartStep: "28", quantizedEndStep: "32" },
  // ];

  return {
    tempos: [{ qpm: tempo }],
    quantizationInfo: { stepsPerQuarter: stepsPerQuarter },
    totalQuantizedSteps: "128",
    notes: notes,
  };
};

export const convertFromMagentaSequence = (magentaSeq) => {
  return magentaSeq.notes.map(note => {
    return {
      note: note.pitch,
      start: note.quantizedStartStep,
      end: note.quantizedEndStep
    }
  })
}
