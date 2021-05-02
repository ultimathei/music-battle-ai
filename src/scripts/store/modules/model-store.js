/**
 * MODEL STORE
 */
import {
  ACT_modelInitRnn,
  ACT_modelInitVae,
  ACT_modelGenerateContinuationRnn,
  ACT_modelGenerateSimilarsVae,
  ACT_sessionSetAiMelodies,
} from "../actions";
import {
  improv_checkpoint,
  // musicVAE_checkpoint_2bar,
  musicVAE_checkpoint_med_4bar,
  // musicVAE_checkpoint,
} from "../../services/magenta-services";

import { convertFromMagentaSequence } from "../../utils/utils";

const SESSION_STORE_LOC = "sessionStore/";

const ModelConfigJSON = {
  type: "MusicVAE",
  dataConverter: {
    type: "MelodyConverter",
    args: {
      numSteps: 256,
      numSegments: 16,
      minPitch: 60,
      maxPitch: 84,
    },
  },
};

export default {
  namespaced: true,
  state: () => ({
    magentaModel: null, // new
    modelMessage: "Loading AI model..",
    isModelReady: false,
    isModelLoading: false,
    // game level specific values
    numberOfSamples: 1,
    similarity: 0.8,
  }),

  getters: {
    magentaModel(state) {
      return state.magentaModel;
    },
    isModelReady(state) {
      return state.isModelReady;
    },
    isModelLoading(state) {
      return state.isModelLoading;
    },
    modelMessage(state) {
      return state.modelMessage;
    },
    numberOfSamples(state) {
      return state.numberOfSamples;
    },
    similarity(state) {
      return state.similarity;
    },
  },
  // basiacally setters
  // using the ES2015 computed property name feature
  mutations: {
    mutateNumberOfSamples(state, newVal) {
      state.numberOfSamples = newVal;
    },
    mutateSimilarity(state, newVal) {
      state.similarity = newVal;
    },
  },
  actions: {
    ////// IDEA ///////
    // idea for VAE interpolate
    // 1. take user's input first
    //  1.a from_sequence = user input notes
    //  1.b determine scale eg. scale = 'CM'
    // 2. get a sample: to_sequence = model.sample(1, 1.0, [scale]) ?? how to sepcify scale?
    // 3. results = vae.interpolate([from_sequence, to_sequence], num_of_interppolation_steps, 1.0, [scale])
    //////////////////

    /**
     * Initialise the model to RNN --  not used right now
     */
    [ACT_modelInitRnn]({ state }) {
      let model = new music_rnn.MusicRNN(improv_checkpoint);
      model.initialize().then(() => {
        // console.log("rnn init done");
        state.magentaModel = model;
        state.isModelReady = true;
        // dispatch(SESSION_ACTION_GENERATE_CONTINUATION);
      });
    },

    [ACT_modelGenerateContinuationRnn]({ state }) {
      state.magentaModel
        .continueSequence(sampleSequence, 60, 0.5, ["CM"])
        .then((resp) => {
          // console.log(resp);
          // state.player.start(resp);
        });
    },

    /**
     * Initialise the model to VAE
     */
    async [ACT_modelInitVae]({ state }, minPitch, maxPitch) {
      state.magentaModel = await new music_vae.MusicVAE(
        musicVAE_checkpoint_med_4bar
      ); //ModelConfigJSON
      // let dataConverter = {
      //   FIRST_PITCH: 2,
      //   NOTE_OFF: 1,
      //   NUM_SPLITS: 0,
      //   SEGMENTED_BY_TRACK: false,
      //   depth: 90,
      //   ignorePolyphony: undefined,
      //   maxPitch: 84,
      //   minPitch: 60,
      //   numSegments: 16,
      //   numSteps: 256,
      // };
      // state.magentaModel.dataConverter = dataConverter;
      // state.magentaModel.spec = { spec: {dataConverter: dataConverter}};
      // model.spec = ModelConfigJSON;
      // state.magentaModel.spec.dataConverter.args.minPitch = 60;
      // state.magentaModel.spec.dataConverter.args.maxPitch = 84;
      // state.magentaModel.dataConverter.minPitch = 60;
      // state.magentaModel.dataConverter.maxPitch = 84;
      await state.magentaModel.initialize();

      // const testIt = new MelodyConverterArgs();
      // console.log(testIt);
      // console.log(mm);

      // console.log('before',model.spec.dataConverter.args)
      if (state.magentaModel.initialized) {
        // console.log(state.magentaModel);
        state.modelMessage = "AI model loaded";

        setTimeout(() => {
          state.isModelReady = true;
          console.log("fadeout complete, element removed");
        }, 1500);
      } else {
        state.modelMessage = "Could not initialize AI model";
      }
    },

    async [ACT_modelGenerateSimilarsVae]({ state }, noteSequence) {
      let samples = await state.magentaModel.similar(
        noteSequence,
        state.numberOfSamples,
        state.similarity
      );

      // do conversions here
      // console.log(samples);
      let melodies = samples.map((sample) =>
        convertFromMagentaSequence(
          sample,
          this.state.instrumentStore.rangeStart,
          this.state.instrumentStore.rangeEnd
        )
      );
      // console.log(melodies);

      this.dispatch(SESSION_STORE_LOC + ACT_sessionSetAiMelodies, melodies);
      // state.isModelLoading = false;
    },
  },
};
