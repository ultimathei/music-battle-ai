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
      pitch: note.note,
      quantizedStartStep: note.start,
      quantizedEndStep: note.end,
    };
    return magentaNote;
  });

  return {
    tempos: [{ qpm: tempo }],
    quantizationInfo: { stepsPerQuarter: stepsPerQuarter },
    totalQuantizedSteps: "128",
    notes: notes,
  };
};

export const convertFromMagentaSequence = (magentaSeq, minPitch, maxPitch) => {
  let notes = [];

  magentaSeq.notes.forEach((note, index, object) => {
    // boundary check for start and end times
    if (note.quantizedStartStep > 128) {
      // do not add to array and remove from samples array
      object.splice(index, 1);
    } else {
      if (note.quantizedEndStep > 128) {
        note.quantizedEndStep = 128;
      }

      // pitch boundary check -- desctructive to magenta samples too
      if (note.pitch > maxPitch) {
        let diff = note.pitch - maxPitch;
        let numOctavesDown = Math.ceil(diff / 12);
        note.pitch -= numOctavesDown * 12;
      } else if (note.pitch < minPitch) {
        let diff = minPitch - note.pitch;
        let numOctavesUp = Math.ceil(diff / 12);
        note.pitch += numOctavesUp * 12;
      }

      notes.push({
        note: note.pitch,
        start: note.quantizedStartStep,
        end: note.quantizedEndStep,
      });
    }
  });

  return notes;
};

export const getOffsetAmount = (quantizer, offset) => {
  let directedOffset = -offset;
  if (offset > quantizer / 2) {
    directedOffset += quantizer;
  }
  return directedOffset;
};

// scale is a note array -> pitch numbers
export const isNoteInScale = (pitch, scale) => {
  return scale.includes(pitch % 12);
};

// calculating the total score of giveb array of battles
export const calculateTotalScore = (battles) => {
  let dailyTotal = 0;
  battles.forEach((battle) => {
    battle.rounds.forEach((round) => {
      dailyTotal += parseInt(round.scores.score) || 0;
      dailyTotal += parseInt(round.scores.improvBonus) || 0;
      dailyTotal += parseInt(round.scores.streakBonu) || 0;
    });
  });
  return dailyTotal;
}
