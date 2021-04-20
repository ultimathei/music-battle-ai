<template>
  <div id="app" class="app">
    <div class="app__header">
      <Logo class="app-header__logo | logo" />
      <div class="app-header__controls | header-controls">
        <MidiController
          class="header-controls__control"
          @note-toggle="updateKeyboardUI"
        />
        <Metronome class="header-controls__control" />
      </div>
    </div>
    <Sequencer class="app__pattern-sequence" />
    <MusicSheet class="app__music-sheet-wrap" />
    <Piano class="app__piano" ref="piano" />

    <div @click="initMagentaRNN">Init core magenta</div>
    <div @click="generate2">generate similars</div>

    <p class="app__footer">
      created by Mate Krisztian for the final year project QMUL @ 2021
    </p>
  </div>
</template>

<script>
import Logo from "./graphics/logo.svg";
import Metronome from "./metronome/metronome.vue";
import MidiController from "./midi/midi-controller.vue";
import MusicSheet from "./music-sheet/music-sheet.vue";
import Piano from "./piano/Piano.vue";
import Sequencer from "./music-sheet/sequencer.vue";
import { mapActions } from "vuex";
import {
  INSTRUMENT_ACTION_START_NOTE,
  INSTRUMENT_ACTION_END_NOTE,
} from "../store/actions";

// magenta pretrained model checkpoints:
// https://github.com/magenta/magenta-js/blob/master/music/checkpoints/checkpoints.json

const sampleSequence = {
  tempos: [{ qpm: 120 }],
  quantizationInfo: { stepsPerQuarter: 4 },
  totalQuantizedSteps: "32",
  notes: [
    { pitch: 60, quantizedStartStep: "0", quantizedEndStep: "2" },
    { pitch: 64, quantizedStartStep: "2", quantizedEndStep: "4" },
    { pitch: 60, quantizedStartStep: "4", quantizedEndStep: "6" },
    { pitch: 64, quantizedStartStep: "6", quantizedEndStep: "8" },
    { pitch: 67, quantizedStartStep: "8", quantizedEndStep: "12" },
    { pitch: 67, quantizedStartStep: "12", quantizedEndStep: "16" },
    { pitch: 60, quantizedStartStep: "16", quantizedEndStep: "18" },
    { pitch: 64, quantizedStartStep: "18", quantizedEndStep: "20" },
    { pitch: 60, quantizedStartStep: "20", quantizedEndStep: "22" },
    { pitch: 64, quantizedStartStep: "22", quantizedEndStep: "24" },
    { pitch: 67, quantizedStartStep: "24", quantizedEndStep: "28" },
    { pitch: 67, quantizedStartStep: "28", quantizedEndStep: "32" },
  ],
};

const improvCheckpoint =
  "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv";

export default {
  name: "app",
  components: {
    Logo,
    Metronome,
    MidiController,
    MusicSheet,
    Piano,
    Sequencer,
  },
  data() {
    return {
      musicalScale: "Cmaj7",
      magentaModel: null,
      coreNoteSequence: sampleSequence,
      player: new core.Player(),
      responseSequenceArray: [],
    };
  },
  methods: {
    ...mapActions("instrumentStore", [
      INSTRUMENT_ACTION_START_NOTE,
      INSTRUMENT_ACTION_END_NOTE,
    ]),
    /**
     * Updating the keyboard UI to refelct changes in currently played MIDI notes.
     */
    updateKeyboardUI(payload) {
      // console.log(payload);
      let pressed_key_DOM = this.$el.querySelector(
        `[data-note-index='${payload.note}']`
      );
      if (pressed_key_DOM) {
        pressed_key_DOM.setAttribute(
          "data-piano-key-pressed",
          payload.on_message
        );

        // play/stop sound for note
        if (payload.on_message)
          this[INSTRUMENT_ACTION_START_NOTE](payload.note);
        else this[INSTRUMENT_ACTION_END_NOTE](payload.note);
      }
    },

    initMagentaRNN() {
      this.magentaModel = new music_rnn.MusicRNN(improvCheckpoint);

      this.magentaModel.initialize().then(() => console.log("done"));
    },

    initMagenta() {
      this.magentaModel = new music_vae.MusicVAE(
        // "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small"
        "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2"
      );
      this.magentaModel.initialize().then(() => {
        // // create the core pattern here
        // let numSamples = 1;
        // let temperature = 0.5;
        // let controlArgs = {}; // this.musicalScale
        // let stepsPerQuarter = 4; // fraction of a quarter
        // let qpm = 120; // bpm

        // this.mvae
        //   .sample(numSamples, temperature, controlArgs, stepsPerQuarter, qpm)
        //   .then((samples) => {
        //     this.player.start(samples[0]);
        //     this.coreNoteSequence = samples[0];
        //     console.log(this.coreNoteSequence);
        //     // console.log(JSON.stringify(this.coreNoteSequence));
        //   });
        this.player.start(this.coreNoteSequence);
        console.log("init done");
      });
    },

    generate2() {
      this.magentaModel
        .continueSequence(sampleSequence, 60, 0.7, ['CM'])
        .then((resp) => {
          console.log(resp);
          this.player.start(resp);
        });
    },

    generateSimilars() {
      let numberOfSamples = 2;
      let similarity = 0.8;
      this.magentaModel
        .similar(this.coreNoteSequence, numberOfSamples, similarity)
        .then((samples) => {
          this.player.start(samples[0]);
          this.responseSequenceArray = samples;
          console.log(this.responseSequenceArray[0].notes);
          console.log(this.responseSequenceArray[1].notes);
        });
    },
  },
};
</script>
