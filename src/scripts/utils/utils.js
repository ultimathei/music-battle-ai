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
}
