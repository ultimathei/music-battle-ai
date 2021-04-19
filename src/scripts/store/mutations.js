/**
 * A list of all possible mutations of the store objects
 */
// -- piano store mutations --
export const PIANO_MUTATION_HEIGHT = "piano_mutation_height";
export const PIANO_MUTATION_KEYSIZE = "piano_mutation_keysize";
export const PIANO_MUTATION_OCTAVE_COUNT = "piano_mutation_octave_count";
export const PIANO_MUTATION_SCALE = "piano_mutation_scale";
export const PIANO_MUTATION_SIDE_PANEL_WIDTH =
  "piano_mutation_side_panel_width";
export const PIANO_MUTATION_WIDTH = "piano_mutation_width";

// -- clock store mutations --
export const CLOCK_MUTATION_UPDATE_AUDIO_CONTEXT =
  "clock_mutation_update_audio_context";
export const CLOCK_MUTATION_UPDATE_BIPS_IN_QUEQUE =
  "clock_mutation_update_bis_in_queue";
export const CLOCK_MUTATION_UPDATE_CURRENT_BAR =
  "clock_mutation_update_current_bar";
export const CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER =
  "clock_mutation_update_current_demisemiquaver";
export const CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND =
  "clock_mutation_update_current_pattern_ind";
export const CLOCK_MUTATION_UPDATE_INTERVAL_ID =
  "clock_mutation_update_interval_id";
export const CLOCK_MUTATION_UPDATE_IS_RUNNING =
  "clock_mutation_update_is_running";
export const CLOCK_MUTATION_UPDATE_NEXT_BIP_TIME =
  "clock_mutation_update_next_bip_time";
export const CLOCK_MUTATION_UPDATE_SOUND_ON =
  "clock_mutation_update_sound_on";

// -- session store mutations --
export const SESSION_MUTATION_ADD_NOTE_TO_CURRENT_PATTERN =
  "session_mutation_add_note_to_current_pattern";
export const SESSION_MUTATION_ADD_PATTERN_TO_SESSION =
  "session_mutation_add_pattern_to_session";
export const SESSION_MUTATION_SET_USER_TURN = "session_mutation_set_user_turn";