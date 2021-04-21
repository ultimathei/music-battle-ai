/**
 * A list of all possible actions on the store objects
 */
// -- piano store actions --
export const PIANO_ACTION_SET_HEIGHT = "piano_action_set_height";
export const PIANO_ACTION_SET_KEYSIZE = "piano_action_set_keysize";
export const PIANO_ACTION_SET_OCTAVE_COUNT = "piano_action_set_octave_count";
export const PIANO_ACTION_SET_SCALE = "piano_action_set_scale";
export const PIANO_ACTION_SET_SIDE_PANEL_WIDTH =
  "piano_action_set_side_panel_width";
export const PIANO_ACTION_SET_WIDTH = "piano_action_set_width";

// -- clock store actions --
export const CLOCK_ACTION_NEXT_BIP = "clock_action_next_bip";
export const CLOCK_ACTION_SCHEDULE_BIP = "clock_action_schedule_bip";
export const CLOCK_ACTION_PLAY_METRONOME = "clock_action_play_metronome";
export const CLOCK_ACTION_ADVANCE_SCHEDULER = "clock_action_advance_scheduler";
export const CLOCK_ACTION_START = "clock_action_start";
export const CLOCK_ACTION_STOP = "clock_action_stop";
export const CLOCK_ACTION_STARTSTOP = "clock_action_startstop";
export const CLOCK_ACTION_RESET = "clock_action_reset";

// -- session store actions --
export const SESSION_ACTION_CLEAR_SESSION = "session_action_clear_session";
export const SESSION_ACTION_GENERATE_FIRST_HALF_RESPONSE =
  "session_action_generate_first_half_response";
export const SESSION_ACTION_GENERATE_SECOND_HALF_RESPONSE =
  "session_action_generate_second_half_response";
export const SESSION_ACTION_PLAY_CURRENT_NOTES =
  "session_action_play_current_notes";

export const SESSION_ACTION_INIT_MODEL_RNN = "session_action_init_model_rnn";
export const SESSION_ACTION_INIT_MODEL_VAE = "session_action_init_model_vae";
export const SESSION_ACTION_GENERATE_CONTINUATION = "session_action_generate_continuation";
export const SESSION_ACTION_GENERATE_SIMILARS = "session_action_generate_similars";

// -- instrument store --
export const INSTRUMENT_ACTION_START_NOTE = "instrument_mutation_start_note";
export const INSTRUMENT_ACTION_END_NOTE = "instrument_mutation_end_note";
export const INSTRUMENT_ACTION_END_ALL_NOTES = "instrument_mutation_end_all_notes";