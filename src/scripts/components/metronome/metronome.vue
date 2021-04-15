<template>
  <div @click="startStop()">Metronome</div>
</template>

<script>
/**
 * This Metronome component is based oaround the idea in this code repository
 * https://github.com/grantjames/metronome by grantjames.
 */
export default {
  name: "Metronome",
  data() {
    return {
      audioContext: null,
      bipsInQueue: [],
      currentBeat: 0,
      tempo: 120,
      lookahead: 25,
      scheduleAheadTime: 0.1,
      nextBipTime: 0.0,
      isRunning: false,
      intervalID: null,
    };
  },
  methods: {
    /**
     * Move to next bip
     */
    nextBip() {
      const secondsPerBeat = 60.0 / this.tempo; // as tempo is in bpm
      this.nextBipTime += secondsPerBeat;
      this.currentBeat++; // keeping track of where we are in a bar
      if (this.currentBeat == 4) {
        this.currentBeat = 0; // wrap to zero
      }
    },

    /**
     * Pushing the next coming bip to the queue
     * Using an oscillator and an envelope to produce sound
     */
    scheduleBip(beatNumber, time) {
      // push the note on the queue, even if we're not playing.
      this.bipsInQueue.push({ bip: beatNumber, time: time });

      // create an oscillator for the bip sound
      const osc = this.audioContext.createOscillator();
      const envelope = this.audioContext.createGain();

      // first accent bip is slightly higher pitch
      osc.frequency.value = beatNumber % 4 == 0 ? 1200 : 800;
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
        this.scheduleBip(this.currentBeat, this.nextBipTime);
        this.nextBip();
      }
    },

    /**
     * Start the metronome
     */
    start() {
      if (this.isRunning) return;

      if (this.audioContext == null) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      this.isRunning = true;

      this.currentBeat = 0;
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
