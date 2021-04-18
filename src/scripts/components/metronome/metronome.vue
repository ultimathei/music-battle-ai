<template>
  <div>
    <MetronomeIcon class="icon-small" />
    <div class="button" @click="startStop()">
      {{ currentPatternInd + 1 }}, {{ currentBar + 1 }} ,
      {{ Math.floor(currentDemisemiquaver / 8) + 1 }}/4
    </div>
  </div>
</template>

<script>
/**
 * This Metronome component is based oaround the idea in this code repository
 * https://github.com/grantjames/metronome by grantjames.
 *
 * Demisemiquaver is a synonim for the 1/32rd musical note
 */
import {
  CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER,
  CLOCK_MUTATION_UPDATE_CURRENT_BAR,
  CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND,
  SESSION_MUTATION_CLEAR_PATTERN,
  SESSION_MUTATION_GENERATE_FIRST_HALF_RESPONSE,
  SESSION_MUTATION_GENERATE_SECOND_HALF_RESPONSE,
  SESSION_MUTATION_SET_USER_TURN,
} from "../../store/mutations";
import { mapMutations } from "vuex";
import MetronomeIcon from "../graphics/metronome.svg";

export default {
  name: "Metronome",
  components: {
    MetronomeIcon,
  },
  data() {
    return {
      audioContext: null,
      bipsInQueue: [],
      currentBar: 0,
      currentDemisemiquaver: 0,
      currentPatternInd: 0,
      denominator: 8,
      intervalID: null,
      isRunning: false,
      lookahead: 25,
      nextBipTime: 0.0,
      scheduleAheadTime: 0.1,
      soundOn: true,
      tempo: 120, // fixed value for now
    };
  },
  methods: {
    /**
     * Mapping mutation functions - essentially synhcronous setters
     *  */
    ...mapMutations("mainClockStore", [
      CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER,
      CLOCK_MUTATION_UPDATE_CURRENT_BAR,
      CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND,
    ]),
    ...mapMutations("sessionStore", [
      SESSION_MUTATION_CLEAR_PATTERN,
      SESSION_MUTATION_GENERATE_FIRST_HALF_RESPONSE,
      SESSION_MUTATION_GENERATE_SECOND_HALF_RESPONSE,
      SESSION_MUTATION_SET_USER_TURN,
    ]),
    /**
     * Move to next bip/tick of the metronome
     */
    nextBip() {
      const secondsPerBeat = 60.0 / this.tempo; // as tempo is in bpm
      this.nextBipTime += secondsPerBeat / this.denominator;
      this.currentDemisemiquaver++; // keeping track of where we are in a bar
      if (this.currentDemisemiquaver == 32) {
        this.currentDemisemiquaver = 0; // wrap to (0,32]
        this.currentBar++;
        // if end of half pattern
        // add half pattern to current pattern?
        if(this.currentBar == 2) {
          // generate first half of response
          // end of half pattern
          this[SESSION_MUTATION_GENERATE_FIRST_HALF_RESPONSE]();
        }
        if (this.currentBar == 4) {
          this.currentBar = 0;
          this.currentPatternInd++;
          // update pattern ind in store
          this[CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND](
            this.currentPatternInd
          );
          // push current pattern to session, clear current pattern
          // end of whole pattern
          this[SESSION_MUTATION_GENERATE_SECOND_HALF_RESPONSE]();
        }
        // update bar in store
        this[CLOCK_MUTATION_UPDATE_CURRENT_BAR](this.currentBar);
      }
      // update current demisemi in store
      this[CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER](
        this.currentDemisemiquaver
      );
    },

    /**
     * Pushing the next coming bip to the queue
     * and calls a function to play the metronome sound
     * on every crotchets (4th note)
     */
    scheduleBip(time) {
      // push the note on the queue, even if we're not playing.
      const demisemi = this.currentDemisemiquaver;
      this.bipsInQueue.push({ bip: demisemi, time: time });

      if (this.soundOn && demisemi % 8 == 0) this.playMetronomeSound(time);
    },

    /**
     * Using an oscillator and an envelope to produce sound
     */
    playMetronomeSound(time) {
      // create an oscillator for the bip sound
      const osc = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();
      // first accent bip is slightly higher pitch
      osc.frequency.value =
        this.currentDemisemiquaver % 32 == 0
          ? this.currentBar % 2 == 0
            ? this.currentBar % 4 == 0
              ? 2000
              : 1600
            : 1200
          : 800;
      envelope.gain.value = 1;
      envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

      osc.connect(envelope);
      envelope.connect(this.audioContext.destination);

      // only playing for a sharp period
      osc.start(time);
      osc.stop(time + 0.03);
    },

    /**
     * Until there are things on the play queue before the next interval,
     * schedule them and advance the pointer.
     */
    scheduler() {
      while (
        this.nextBipTime <
        this.audioContext.currentTime + this.scheduleAheadTime
      ) {
        this.scheduleBip(this.nextBipTime);
        this.nextBip();
      }
    },

    /**
     * Start the metronome
     */
    start() {
      if (this.isRunning) return;

      // clear pattern
      this[SESSION_MUTATION_CLEAR_PATTERN]();

      if (this.audioContext == null) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      this.isRunning = true;
      this.nextBipTime = this.audioContext.currentTime + 0.05;

      // the trick is to use an interval combined with the webaudio context
      // so we can reliably set the tempo
      this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    },

    /**
     * Stop the metronome
     */
    stop() {
      this.isRunning = false;
      clearInterval(this.intervalID);
      // reset pointers
      this.currentPatternInd = 0;
      this[CLOCK_MUTATION_UPDATE_CURRENT_PATTERN_IND](this.currentPatternInd);
      this.currentBar = 0;
      this[CLOCK_MUTATION_UPDATE_CURRENT_BAR](this.currentBar);
      this.currentDemisemiquaver = 0;
      this[CLOCK_MUTATION_UPDATE_CURRENT_DEMISEMIQUAVER](
        this.currentDemisemiquaver
      );
    },

    /**
     * Flip stop/start for the metronome
     */
    startStop() {
      if (this.isRunning) {
        this.stop();
      } else {
        this.start();
      }
    },
  },
};
</script>
