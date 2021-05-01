/**
 * A list of all possible mutations of the store objects
 * All MUTATION names are prefixed with MUT_ (short for mutation)
 * and the keyword for the sub-store
 */
// -- piano store mutations --
export const MUT_pianoHeight = "MUT_pianoHeight";
export const MUT_pianoKeysize = "MUT_pianoKeysize";
export const MUT_pianoOctaveCount = "MUT_pianoOctaveCount";
export const MUT_pianoScale = "MUT_pianoScale";
export const MUT_pianoPanelWidth =
  "MUT_pianoPanelWidth";
export const PIANO_MUTATION_WIDTH = "piano_mutation_width";

// -- clock store mutations --
export const MUT_clockAudioContext =
  "MUT_clockAudioContext";
export const MUT_clockBipsInQueue =
  "clock_mutation_update_bis_in_queue";
export const MUT_clockCurrentBar =
  "MUT_clockCurrentBar";
export const MUT_clockCurrentDemisemiquaver =
  "MUT_clockCurrentDemisemiquaver";
export const MUT_clockCurrentPatternInd =
  "MUT_clockCurrentPatternInd";
export const MUT_clockIntervalID =
  "MUT_clockIntervalID";
export const MUT_clockIsRunning =
  "MUT_clockIsRunning";
export const MUT_clockNextBipTime =
  "MUT_clockNextBipTime";
export const MUT_clockMetronomeSoundOn =
  "MUT_clockMetronomeSoundOn";

// -- session store mutations --
export const MUT_sessionAddNoteToCurrentPattern =
  "MUT_sessionAddNoteToCurrentPattern";
export const MUT_sessionAddPatternToSession =
  "MUT_sessionAddPatternToSession";
export const MUT_sessionUserTurn = "MUT_sessionUserTurn";
