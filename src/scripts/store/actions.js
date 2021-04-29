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
export const CLOCK_ACTION_RESET_PRECOUNT = "clock_action_reset_precount";

// -- session store actions --
export const SESSION_ACTION_CLEAR_SESSION = "session_action_clear_session";
export const SESSION_ACTION_GENERATE_FIRST_HALF_RESPONSE =
  "session_action_generate_first_half_response";
export const SESSION_ACTION_GENERATE_RESPONSES =
  "session_action_generate_responses";
export const SESSION_ACTION_PLAY_CURRENT_NOTES =
  "session_action_play_current_notes";
export const SESSION_ACTION_PREVIEW_BASE_PATTERN =
  "session_action_preview_base_pattern";
export const SESSION_ACTION_CONFIRM_SEED =
  "session_action_confirm_seed";
export const SESSION_ACTION_CLOSE_UNFINISHED_NOTES =
  "session_action_close_unfinished_notes";
export const SESSION_ACTION_FINISHED_MELODY = "session_action_finished_melody";
export const SESSION_ACTION_LOADING = "session_action_loading";
export const SESSION_ACTION_SET_AIMELODIES = "session_action_set_aimelodies";


  // -- model actions --
export const MODEL_ACTION_INIT_RNN = "model_action_init_rnn";
export const MODEL_ACTION_INIT_VAE = "model_action_init_vae";
export const MODEL_ACTION_GENERATE_CONTINUATION =
  "model_action_generate_continuation";
export const MODEL_ACTION_GENERATE_SIMILARS = "model_action_generate_similars";

// -- instrument actions --
export const INSTRUMENT_ACTION_START_NOTE = "instrument_mutation_start_note";
export const INSTRUMENT_ACTION_END_NOTE = "instrument_mutation_end_note";
