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
  ACT_clockReset,
  ACT_clockResetPrecount,
  ACT_clockStartStop,
  ACT_clockStop,
  ACT_instrumentEndNote,
  ACT_instrumentStartNote,
  ACT_modelGenerateSimilarsVae,
  ACT_sessionClearSession,
  ACT_sessionCloseUnfinishedNotes,
  ACT_sessionConfirmSeed,
  ACT_sessionFinishedMelody,
  ACT_sessionPlayCurrentNotes,
  ACT_sessionSetAiMelodies,
  ACT_sessionSetLoading,
} from "../actions";
import { convertToMagentaSample, isNoteInScale } from "../../utils/utils";

const CLOCK_STORE_LOC = "mainClockStore/";
const INSTRUMENT_STORE_LOC = "instrumentStore/";
const MODEL_STORE_LOC = "modelStore/";

export default {
  namespaced: true,
  state: () => ({
    userTurn: true, // flags status of turn
    currentPattern: [], // alwyas stores the latest pattern
    isSessionLoading: false, // flag status of session
    seedMelody: null, // the seed melody of the session
    quantizedSeedMelody: null, // see quantizeSeedMelody action
    useQuantized: false, // flag to check if quantized melody or original to be used
    aiMelodyArray: [], // to store the melodies generated by the ai, based on seed converted from magenta samples format
    magentaSamples: [], // a list of response samples in magenta sample format
    userMelodyArray: [], // the user's attemps for each aiMelody
    patternPointer: 0, // a pointer to the current match in the battle
    prematureNotes: [], // this would be used to cache notes that are strated just before the pattern start
    currentMatchIndex: 0, // the index of current match in the game
    deleteInitiated: false, // flag if user asked to delete session

    battleScale: [], // do this!
    battleScores: null,
    streakIndex: 0,
    sessionCreated: null,
  }),

  getters: {
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
    magentaSamples(state) {
      return state.magentaSamples;
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
    patternPointer(state) {
      return state.patternPointer;
    },
    battleScale(state) {
      return state.battleScale;
    },
    battleScores(state) {
      return state.battleScores;
    },
    streakIndex(state) {
      return state.streakIndex;
    },
    sessionCreated(state) {
      return state.sessionCreated;
    },
    avgBattleScore(state) {
      return state.battleScores.score;
    },
    totalBattleBonus(state) {
      return state.battleScores.improvBonus;
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
        // } else if (state.aiMelodyArray.length < 1 && state.userTurn) {
      } else if (
        state.patternPointer == state.aiMelodyArray.length &&
        state.userTurn
      ) {
        // console.log("whole session finished, stop the clock..");
        this.dispatch(CLOCK_STORE_LOC + ACT_clockStop);
        this.commit("mutateMode", "scoring");
        dispatch("evaluateBattleScore");
      } else {
        // console.log("still have melodies to play, move to next..");
        dispatch("moveToNextMelody");
      }
    },

    evaluateBattleScore({ state }) {
      console.log("evaluating score here");
      // step 1: push currentPattern to session
      state.userMelodyArray.push([...state.currentPattern]);

      // determine scale
      let battleScores = []; // a list of scores for the rounds
      // for each pattern pair:
      state.aiMelodyArray.forEach((aiMelody, index) => {
        let score = 0;
        let improvBonus = 0;
        // no score added if userMelody is empty
        if (state.userMelodyArray[index].length > 0) {
          // for each demisemi portion: (0...127)
          for (let i = 0; i < 128; i++) {
            let aiNoteHere = aiMelody.find(
              (aiNote) => aiNote.start <= i && aiNote.end > i
            );
            let userNoteHere = state.userMelodyArray[index].find(
              (userNote) => userNote.start <= i && userNote.end > i
            );
            // if ai-note present - there is a note who's start and end date wraps this i value
            if (aiNoteHere) {
              // a. have matching player-note   [+++]
              if (userNoteHere && userNoteHere.note == aiNoteHere.note) {
                score += 1;
              }
              // b. different player note
              // b.1 in scale               [+]
              else if (
                userNoteHere &&
                isNoteInScale(userNoteHere.note, state.battleScale)
              ) {
                // score += 0.5;
                improvBonus += 0.5;
              }
              // b.2 out of scale           [-]
              else if (userNoteHere) {
                // score -= 1.5;
                // score -= 1;
                improvBonus -= 1;
              }
              // c. empty                       [.]
              else {
                // score -= 1;
              }
            }
            // else (ai-note NOT present)
            else {
              // a. player-note empty           [+++]
              if (!userNoteHere) {
                score += 1;
              }
              // b. has player note
              // b.1 in scale               [+]
              else if (isNoteInScale(userNoteHere.note, state.battleScale)) {
                // score += 0.5;
                improvBonus += 1;
              }
              // b.2 out of scale           [-]
              else {
                // score -= 1;
                improvBonus -= 1;
              }
            }
          }
        }
        battleScores.push({ score, improvBonus });
      });

      // console.log("battleScore", battleScores);
      const sum = battleScores.reduce((a, b) => a + b.score, 0);
      const avg = sum / battleScores.length || 0;
      const score = (avg / 128).toFixed(2) * 100;
      console.log('battlescores', battleScores);
      const improvSum = battleScores.reduce((a, b) => a + b.improvBonus, 0);
      const improvBonus =  Math.max((improvSum / 128).toFixed(2) * 100, 0);

      state.battleScores = {
        score: score,
        improvBonus: improvBonus,
        streakBonus: state.streakIndex * 10
      };

      // save it
      let battleObject = {
        seedMelody: state.seedMelody,
        rounds: [
          {
            aiMelodyArray: state.aiMelodyArray,
            userMelodyArray: state.userMelodyArray,
            scores: state.battleScores,
          },
        ],
        // modelSimilarity: this.state.similarity,
      };
      this.dispatch("saveBattle", battleObject);
    },

    [ACT_sessionConfirmSeed]({ state }) {
      // state.isSessionLoading = true; // use this to display loader?
      // as confirmed make current pattern the seed
      state.seedMelody = state.useQuantized
        ? state.quantizedSeedMelody
        : state.currentPattern;
      state.currentPattern = state.seedMelody;
      state.useQuantized = false;
      state.quantizedSeedMelody = null;
      state.sessionCreated = Date.now();

      // get ai melodies
      this.dispatch(
        MODEL_STORE_LOC + ACT_modelGenerateSimilarsVae,
        convertToMagentaSample(state.seedMelody, 120, 8)
      );
    },

    [ACT_sessionSetAiMelodies]({ state, dispatch }, melodiesArray) {
      console.log("steped in ACT_sessionSetAiMelodies");
      state.aiMelodyArray = melodiesArray;
      
      // determine scale 
      let scale = [];
      melodiesArray.forEach(melody => {
        melody.forEach(note => {
          let pitch = note.note % 12;
          if(!scale.includes(pitch)) {
            scale.push(pitch);
          }
        });
      });
      state.battleScale = scale;
      console.log('scale', scale);

      dispatch("nextRobotMelody"); // move below?

      // reset precount and start the battle
      this.dispatch(CLOCK_STORE_LOC + ACT_clockReset);
      this.dispatch(CLOCK_STORE_LOC + ACT_clockResetPrecount);
      this.dispatch(CLOCK_STORE_LOC + ACT_clockStartStop);
      this.commit("mutateMode", "battle");
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
      // 1. push old current pattern to userMelodyArray except the seed melody
      if (state.patternPointer > 0)
        state.userMelodyArray.push([...state.currentPattern]);

      // 2. get the next element from the start of the ai array
      let melody = state.aiMelodyArray[state.patternPointer];
      state.patternPointer += 1; // increaase pointer

      // 3. add it as the current pattern
      state.currentPattern = melody;
      // flip user turn boolean
      state.userTurn = false;
    },

    nextUserMelody({ state }) {
      // console.log("transitioning from ROBOT to USER turn..");
      // clear current pattern - make it ready for user to play
      state.currentPattern = [];
      // flip user turn boolean
      state.userTurn = true;
    },

    // clear/empty the current session
    [ACT_sessionClearSession]({ state }) {
      state.currentPattern = [];
      state.aiMelodyArray = [];
      state.userMelodyArray = [];
      state.userTurn = true;
      state.seedMelody = null;
      state.useQuantized = false;
      state.quantizedSeedMelody = null;
      state.deleteInitiated = false;
      state.patternPointer = 0;
      state.sessionCreated = null;

      // reset model parameters (similarity, numberofsamples)
      this.commit(MODEL_STORE_LOC + "mutateSimilarity", 0.9);
      this.commit(MODEL_STORE_LOC + "mutateNumberOfSamples", 2);
    },

    continueSession({ state, commit }) {
      console.log(state.seedMelody);
      state.currentPattern = state.seedMelody;
      state.aiMelodyArray = [];
      state.userMelodyArray = [];
      state.userTurn = true;
      state.patternPointer = 0;
      state.streakIndex +=1;

      // get ai melodies
      this.dispatch(
        MODEL_STORE_LOC + ACT_modelGenerateSimilarsVae,
        convertToMagentaSample(state.seedMelody, 120, 8)
      );
    },

    [ACT_sessionCloseUnfinishedNotes]({ state }) {
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
        this.dispatch(INSTRUMENT_STORE_LOC + ACT_instrumentEndNote, note.note);
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
    },
  },
};
