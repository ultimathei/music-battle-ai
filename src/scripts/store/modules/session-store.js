/**
 * Store module for the recorded session
 * including a list of musical patterns played by
 * user and the responses played by app
 *
 * A session is a list of patterns.
 * A pattern is essentially 4 bars played by either the user or the response of
 * the app (ai/robot) for the pattern.
 */
import { getOffsetAmount } from "../../utils/utils";
import { MUT_sessionAddNoteToCurrentPattern } from "../mutations";
import {
  ACT_sessionGenerateResponses,
  ACT_sessionClearSession,
  ACT_sessionPlayCurrentNotes,
  ACT_sessionConfirmSeed,
  ACT_sessionCloseUnfinishedNotes,
  ACT_sessionFinishedMelody,
  ACT_sessionSetLoading,
  ACT_sessionSetAiMelodies,
  ACT_instrumentStartNote,
  ACT_instrumentEndNote,
  ACT_modelGenerateSimilarsVae,
  ACT_clockReset,
  ACT_clockResetPrecount,
  ACT_clockStartStop,
  ACT_clockStop,
} from "../actions";
import {
  convertToMagentaSample,
  convertFromMagentaSequence,
} from "../../utils/utils";

const INSTRUMENT_STORE_LOC = "instrumentStore/";
const MODEL_STORE_LOC = "modelStore/";
const CLOCK_STORE_LOC = "mainClockStore/";

export default {
  namespaced: true,
  state: () => ({
    userTurn: true, // flags status of turn
    currentPattern: [], // alwyas stores the latest pattern
    session: [], // a list of alternating user/response patterns
    isSessionLoading: false, // flag status of session
    seedMelody: null, // the seed melody of the session
    quantizedSeedMelody: null, // see quantizeSeedMelody action
    useQuantized: false, // flag to check if quantized melody or original to be used
    aiMelodyArray: [], // to store the melodies generated by the ai, based on seed
    userMelodyArray: [], // the user's attemps for each aiMelody
    prematureNotes: [], // this would be used to cache notes that are strated just before the pattern start
    currentMatchIndex: 0, // the index of current match in the game session
    deleteInitiated: false, // flag if user asked to delete session
  }),

  getters: {
    session(state) {
      return state.session;
    },
    userTurn(state) {
      return state.userTurn;
    },
    currentPattern(state) {
      return state.currentPattern;
    },
    seedMelody(state) {
      return state.seedMelody;
    },
    userMelodyArray(state) {
      return state.userMelodyArray;
    },
    aiMelodyArray(state) {
      return state.aiMelodyArray;
    },
    isSessionLoading(state) {
      return state.isSessionLoading;
    },
    useQuantized(state) {
      return state.useQuantized;
    },
    quantizedSeedMelody(state) {
      return state.quantizedSeedMelody;
    },
    deleteInitiated(state) {
      return state.deleteInitiated;
    },
  },

  actions: {
    // IDEA ///////
    // idea for VAE interpolate
    // 1. take user's input first
    //  1.a from_sequence = user input notes
    //  1.b determine scale eg. scale = 'CM'
    // 2. get a sample: to_sequence = model.sample(1, 1.0, [scale]) ?? how to sepcify scale?
    // 3. results = vae.interpolate([from_sequence, to_sequence], num_of_interppolation_steps, 1.0, [scale])
    //////////////////
    ////////

    // IDEA
    // for prematureNotes: if not userTurn and MIDI not receieved:
    // collect theese notes to an array with start value 0.
    // is end note message received for same pitch, remove from array
    // at the start of a new user pattern, push the content of this array to
    // the currentPattern array

    ///////
    /**
     * Playback of current pattern sound
     * @param {*} time
     */
    [ACT_sessionPlayCurrentNotes]({ state }, currentTime) {
      const melodyToPlay = state.useQuantized
        ? state.quantizedSeedMelody
        : state.currentPattern;

      melodyToPlay.forEach((note) => {
        if (note.start == note.end) {
          // do not play!
        } else if (note.start >= 0 && note.start == currentTime) {
          // play sound for note
          this.dispatch(
            INSTRUMENT_STORE_LOC + ACT_instrumentStartNote,
            note.note
          );
        } else if (note.end && note.end == currentTime) {
          // stop sound for note
          this.dispatch(
            INSTRUMENT_STORE_LOC + ACT_instrumentEndNote,
            note.note
          );
        }
      });
    },

    // message recieved from clock at the end of each 4-bar cycle
    [ACT_sessionFinishedMelody]({ state, dispatch }) {
      // stop all notes, this prevents overflows
      // console.log(state.currentPattern);
      dispatch(ACT_sessionCloseUnfinishedNotes);

      if (!state.seedMelody) {
        // change to modes
        // send stop clock message
        // console.log("at the end of seed melody, stop clock, display edit..");
        this.dispatch(CLOCK_STORE_LOC + ACT_clockStop);

        // if there were notes recorded to currentPattern
        if (
          state.currentPattern.length == 0 &&
          this.state.mode == "seed_recording"
        )
          this.commit("mutateMode", "initial");
      } else if (state.aiMelodyArray.length < 1 && state.userTurn) {
        // console.log("whole session finished, stop the clock..");
        this.dispatch(CLOCK_STORE_LOC + ACT_clockStop);
        this.commit("mutateMode", "scoring");
      } else {
        // console.log("still have melodies to play, move to next..");
        dispatch("moveToNextMelody");
      }
    },

    async [ACT_sessionConfirmSeed]({ state, dispatch }) {
      // state.isSessionLoading = true; // use this to display loader?
      // as confirmed make current pattern the seed
      state.seedMelody = state.useQuantized
        ? state.quantizedSeedMelody
        : state.currentPattern;
      state.currentPattern = state.seedMelody;
      state.useQuantized = false;
      state.quantizedSeedMelody = null;
      state.isSessionLoading = true;

      // get ai melodies
      await this.dispatch(
        MODEL_STORE_LOC + ACT_modelGenerateSimilarsVae,
        convertToMagentaSample(state.seedMelody, 120, 8)
      );
      state.isSessionLoading = false;

      dispatch("nextRobotMelody");

      // reset precount and start the battle
      this.dispatch(CLOCK_STORE_LOC + ACT_clockReset);
      this.dispatch(CLOCK_STORE_LOC + ACT_clockResetPrecount);
      this.dispatch(CLOCK_STORE_LOC + ACT_clockStartStop);
      this.commit("mutateMode", "battle");
    },

    [ACT_sessionSetAiMelodies]({ state }, melodiesArray) {
      state.aiMelodyArray = melodiesArray;
    },

    [ACT_sessionSetLoading]({ state }) {
      state.isSessionLoading = true;
    },

    // make an action variable for this?
    moveToNextMelody({ state, dispatch }) {
      // move to next melody
      if (state.userTurn) {
        dispatch("nextRobotMelody");
      } else {
        dispatch("nextUserMelody");
      }
    },

    nextRobotMelody({ state }) {
      // console.log("transitioning from USER to ROBOT turn..");
      // 1. push old current pattern to session
      const patternToArchive = {
        type: "user",
        pattern: [...state.currentPattern],
      };

      state.session.push(patternToArchive);
      state.userMelodyArray.push(patternToArchive);

      // 2. get the next element from the start of the ai array
      let melody = state.aiMelodyArray.shift();

      // clean pattern to match limits and range
      melody = convertFromMagentaSequence(melody);
      // console.log(melody);
      // for (let i = 0; i<melody.length)

      // console.log(melody);
      // 3. add it as the current pattern
      state.currentPattern = melody;
      // flip user turn boolean
      state.userTurn = false;
    },

    nextUserMelody({ state }) {
      // console.log("transitioning from ROBOT to USER turn..");
      // 1. push old current pattern to session
      const patternToArchive = {
        type: "robot",
        pattern: [...state.currentPattern],
      };

      state.session.push(patternToArchive);
      // state.  .push(patternToArchive);

      // clear current pattern - make it ready for user to play
      state.currentPattern = [];
      // flip user turn boolean
      state.userTurn = true;
    },

    // modified now -- not used now
    [ACT_sessionGenerateResponses]({ state }) {
      // transitioning from user turn to response turn..
      if (state.userTurn) {
        // console.log("generate ai patterns here..");
        // dispatch(ACT_sessionCloseUnfinishedNotes);
        // 1. push old current pattern to session
        const patternToArchive = {
          type: "user",
          pattern: [...state.currentPattern],
        };
        state.session.push(patternToArchive);

        // 2. response pattern becomes the new current pattern
        if (state.responseSequenceArray.length < 1) {
          // stop playback
          this.dispatch(CLOCK_STORE_LOC + ACT_clockStartStop);
          return;
        }

        let sample = state.responseSequenceArray.shift();
        // console.log(sample);

        state.currentPattern = convertFromMagentaSequence(sample);
      } else {
        // transitioning from response turn to user turn..
        // 1. push old current pattern to session
        const patternToArchive = {
          type: "robot",
          pattern: [...state.currentPattern],
        };
        state.session.push(patternToArchive);

        // clear current pattern - make it ready for user to play
        state.currentPattern = [];
      }
      // flip user turn boolean
      state.userTurn = !state.userTurn;
    },

    // clear/empty the current session
    [ACT_sessionClearSession]({ state }) {
      state.currentPattern = [];
      state.aiMelodyArray = [];
      state.session = [];
      state.userTurn = true;
      state.seedMelody = null;
      state.useQuantized = false;
      state.quantizedSeedMelody = null;
      state.deleteInitiated = false;
    },

    [ACT_sessionCloseUnfinishedNotes]({ state, dispatch }) {
      state.currentPattern.forEach((note) => {
        // console.log(note);
        if (!note.end || note.end > 128) {
          note.end = 128;
        }
        // test this!
        if (!note.start) {
          note.start = 0;
        }

        // stop playback of all notes
        this.dispatch(
          INSTRUMENT_STORE_LOC + ACT_instrumentEndNote,
          note.note
        );
      });
    },

    switchNote({ state }, payload) {
      const newPitch = payload.pitch;
      const now = payload.now;
      // console.log(newPitch, now);
      // console.log(state.currentPattern);
      let previousNote =
        state.currentPattern[state.currentPattern.length - 1] || null;

      // if (previousNote && previousNote.start == now) {
      //   state.currentPattern.pop(); // remove the last item if it has 0 length
      //   console.log('should remove a note here', state.currentPattern);
      //   return;
      // }

      if (newPitch == null) {
        // previous note ended, no new note started
        if (previousNote) {
          if (previousNote.start == now) {
            state.currentPattern.pop(); // remove the last item if it has 0 length
            // console.log('should remove a note here', state.currentPattern);
          } else {
            previousNote.end = now;
          }
        }
      } else {
        // direct switch to new note from previous
        if (previousNote) {
          if (!previousNote.end && previousNote.note == newPitch) {
            return;
          } else if (!previousNote.end) {
            previousNote.end = now;
          }
        }
        // add this new note to pattern
        state.currentPattern.push({
          note: newPitch,
          start: now,
          // no end yet
        });
      }

      // if (previousNote && previousNote.start == previousNote.end) {
      //   state.currentPattern.pop(); // remove the last item if it has 0 length
      //   // console.log('should remove a note here', state.currentPattern);
      // }
    },

    quantizeSeedMelody({ state }) {
      // if already quantized
      if (state.quantizedSeedMelody) {
        state.useQuantized = !state.useQuantized;
        return;
      }

      // quantize melody here
      let quantizer = 4;

      // -- Naive quantization of all notes of melody --
      let newPattern = [];
      state.currentPattern.forEach((note) => {
        // do not add notes with 0 length
        if (note.start != note.end) {
          let offGridStartAmount = note.start % quantizer;
          let offsetStart = getOffsetAmount(quantizer, offGridStartAmount);
          let offGridEndAmount = note.end % quantizer;
          let offsetEnd = getOffsetAmount(quantizer, offGridEndAmount);

          let newStart = note.start + offsetStart;
          let newEnd = note.end + offsetEnd;

          // if a quantized note got reduced to 0, make it minimum length of quantizer size
          if (newStart == newEnd) {
            if (newStart == 128) {
              newStart -= quantizer;
            } else {
              newEnd += quantizer;
            }
          }

          // add qunatized note
          newPattern.push({
            note: note.note,
            start: newStart,
            end: newEnd,
          });
        }
      });

      // for each note, check if they have overlap with next ones
      newPattern.forEach((_, ind, arr) => {
        let i = ind + 1;
        let overlaps = [];
        while (i < arr.length && arr[i].start == _.start) {
          overlaps.push(arr[i]);
          i++;
        }

        // deal with possibly generated overlaps
        if (overlaps.length > 0) {
          let addition = Math.ceil(quantizer / (overlaps.length + 1));
          _.end = _.start + addition;
          overlaps[0].start = _.end;
          i = 1;
          while (i < overlaps.length) {
            // set start
            overlaps[i].start = overlaps[i - 1].end;
            // set end (except last, that keeps its end)
            if (i < overlaps.length - 1) {
              overlaps[i].end = overlaps[i].start + i * addition;
            }
            i++;
          }
        }
      });

      // set quantized melody
      state.quantizedSeedMelody = newPattern;
      // state.quantizedSeedMelody = finalPattern;
      state.useQuantized = true;
    },
  },

  // basiacally setters
  // using the ES2015 computed property name feature
  mutations: {
    // add new incoming notes (either start or end msg) ONLY when in user turn
    [MUT_sessionAddNoteToCurrentPattern](state, data) {
      if (!state.userTurn) return; // safety check

      // its a start message push it straight to the pattern
      if (data.start) {
        // disallowing polyphony..
        // check if there are unfinished notes
        if (state.currentPattern.length > 0) {
          let lastNote = state.currentPattern[state.currentPattern.length - 1];
          if (!lastNote.end) {
            lastNote.end = data.start; // close off previous
          }
        }

        state.currentPattern.push({
          ...data,
          start: Math.max(data.start - 1, 0),
        });
      } else if (data.end) {
        // else it's end message so
        // find the note that has no end yet (its start pair)
        state.currentPattern.forEach((n) => {
          if (n.note === data.note && !n.end) {
            n.end = data.end;
            return;
          }
        });

        // if did not find, that means it was a cut off note, for now I just ignore it
      }
    },

    mutateDeleteInitiated(state) {
      state.deleteInitiated = !state.deleteInitiated;
    }
  },
};
