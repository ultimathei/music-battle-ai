/**
 * A list of all possible actions on the store objects
 * All ACTION names are prefixed with ACT_ (short for action)
 * and the keyword for the sub-store
 */
// -- piano store actions --
export const ACT_pianoSetHeight = "ACT_pianoSetHeight";
export const ACT_pianoSetKeysize = "ACT_pianoSetKeysize";
export const ACT_pianoSetOctaveCount = "ACT_pianoSetOctaveCount";
export const ACT_pianoSetScale = "ACT_pianoSetScale";
export const ACT_pianoSetPanelWidth =
  "ACT_pianoSetPanelWidth";
export const ACT_pianoSetWidth = "ACT_pianoSetWidth";

// -- clock store actions --
export const ACT_clockNextBip = "ACT_clockNextBip";
export const ACT_clockScheduleBip = "ACT_clockScheduleBip";
export const ACT_clockPlayMetronome = "ACT_clockPlayMetronome";
export const ACT_clockAdvanceScheduler = "ACT_clockAdvanceScheduler";
export const ACT_clockStart = "ACT_clockStart";
export const ACT_clockStop = "ACT_clockStop";
export const ACT_clockStartStop = "ACT_clockStartStop";
export const ACT_clockReset = "ACT_clockReset";
export const ACT_clockResetPrecount = "ACT_clockResetPrecount";

// -- session store actions --
export const ACT_sessionClearSession = "ACT_sessionClearSession";
export const ACT_sessionGenerateFirstHalfResponse =
  "ACT_sessionGenerateFirstHalfResponse";
export const ACT_sessionGenerateResponses =
  "ACT_sessionGenerateResponses";
export const ACT_sessionPlayCurrentNotes =
  "ACT_sessionPlayCurrentNotes";
export const ACT_sessionConfirmSeed =
  "ACT_sessionConfirmSeed";
export const ACT_sessionCloseUnfinishedNotes =
  "ACT_sessionCloseUnfinishedNotes";
export const ACT_sessionFinishedMelody = "ACT_sessionFinishedMelody";
export const ACT_sessionSetLoading = "ACT_sessionSetLoading";
export const ACT_sessionSetAiMelodies = "ACT_sessionSetAiMelodies";


  // -- model actions --
export const ACT_modelInitRnn = "ACT_modelInitRnn";
export const ACT_modelInitVae = "ACT_modelInitVae";
export const ACT_modelGenerateContinuationRnn =
  "ACT_modelGenerateContinuationRnn";
export const ACT_modelGenerateSimilarsVae = "ACT_modelGenerateSimilarsVae";

// -- instrument actions --
export const ACT_instrumentStartNote = "instrument_mutation_start_note";
export const ACT_instrumentEndNote = "instrument_mutation_end_note";
