<template>
  <div>
    <MidiIcon class="icon-small"/>
    <div class="button" @click="getMIDI()">Reconnect MIDI</div>
  </div>
</template>

<script>
// import MidiIcon from '../graphics/midi-controller.svg';
import MidiIcon from '../graphics/midi.svg';
import { mapGetters, mapMutations } from "vuex";
import { SESSION_MUTATION_ADD_NOTE } from '../../store/mutations';

export default {
  name: "MidiController",
  components: {
    MidiIcon,
  },
  mounted() {
    this.getMIDI();
  },
  methods: {
    /**
     * Mapping the getters (not the state) to limit ability of modifications to actions
     */
    ...mapGetters("mainClockStore", ["currentMusicalTime"]),
    ...mapMutations("sessionStore", [SESSION_MUTATION_ADD_NOTE]),

    /**
     *
     */
    getMIDI() {
      if (navigator.requestMIDIAccess) {
        console.log("This browser supports WebMIDI!");
      } else {
        console.log("WebMIDI is not supported in this browser.");
      }

      navigator
        .requestMIDIAccess()
        .then(this.onMIDISuccess, this.onMIDIFailure);
    },

    /**
     * MIDI connection failure handler
     */
    onMIDIFailure() {
      console.log("Could not access your MIDI devices.");
    },

    /**
     * On successful MIDI connection, we set up event listener for inputs
     */
    onMIDISuccess(midiAccess) {
      console.log("MIDI successfully connected", midiAccess);
      const inputs = midiAccess.inputs;
      // console.log("inputs: ", inputs);
      // const outputs = midiAccess.outputs
      // console.log('outputs: ', outputs)

      for (let input of inputs.values())
        input.onmidimessage = this.getMIDIMessage;
    },

    /**
     * Handling and elegating the recieved MIDI messages
     */
    getMIDIMessage(midiMsg) {
      // console.log(midiMsg);
      const command = midiMsg.data[0];
      // notes (pitch): 0...127
      // example: lowest note on an 88-key piano has a value of 21
      // the highest is 108. A “middle C” is 60.
      const note = midiMsg.data[1];
      // velocity: 0..127
      // minimum velocity for note-on is 1
      // velocity might not be present for noteoff
      const velocity = midiMsg.data.length > 2 ? midiMsg.data[2] : 0;

      // command types we are interested in:
      // 144 marks a “note on” event
      // 128 marks a “note off” event (or 144 with 0 velocity)
      switch (command) {
        // noteOn
        case 144:
          if (velocity > 0) {
            this.noteTrigger(note, true, velocity);
          } else {
            this.noteTrigger(note, false);
          }
          break;
        // noteOff
        case 128:
          this.noteTrigger(note, false);
          break;
        // expand switch to handle other command types
      }
    },
    
    /**
     * Toggles the key for given note on/off
     * Also records the note changes to store
     */
    noteTrigger(note, on_message = true, velocity = 0) {
      const payload = {
        on_message,
        note: note,
        timestamp: new Date().getTime(),
        velocity,
      };
      // emit to parent so the dom can be updated
      this.$emit("note-toggle", payload);
      // get current musical time position (using the global metronome)
      const currentMusicalTime = this.currentMusicalTime();
      // record to store
      this.recordNoteChanges(on_message, note, currentMusicalTime);
    },

    /**
     * 
     */
    recordNoteChanges(on_message, note, currentMusicalTime){
      //   {
      //     note: 8,
      //     start: { pattern: 0, bar: 0, demisemi: 0 }, // pattern*128 + bar*32 + demisemi
      //     end: { pattern: 0, bar: 0, demisemi: 16 },
      //   },
      // ];
      let data;
      if(on_message) {
        data = {
          note: note,
          start: this.convertToPatternTime(currentMusicalTime),
        }
      }
      else{
        data = {
          note: note,
          end: this.convertToPatternTime(currentMusicalTime),
        }
      }
      // send data here to store
      this[SESSION_MUTATION_ADD_NOTE](data);     
      
      // // print to console
      // if (on_message)
      //   console.log(
      //     `%c note started at `,
      //     "background: #222; color: #bada55",
      //     JSON.stringify(currentMusicalTime)
      //   );
      
      // else
      //   console.log(
      //     `%c note ended at `,
      //     "background: #222; color: red",
      //     JSON.stringify(currentMusicalTime)
      //   );
    },

    convertToPatternTime(musicalTime){
      return musicalTime.pattern*128 + musicalTime.bar*32 + musicalTime.demisemi;
    }
  },
};
</script>
