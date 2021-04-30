/**
 * MODEL STORE
 */
import {
  MODEL_ACTION_INIT_RNN,
  MODEL_ACTION_INIT_VAE,
  MODEL_ACTION_GENERATE_CONTINUATION,
  MODEL_ACTION_GENERATE_SIMILARS,
  SESSION_ACTION_SET_AIMELODIES,
} from "../actions";
import {
  improv_checkpoint,
  musicVAE_checkpoint_2bar,
  musicVAE_checkpoint_med_4bar,
  musicVAE_checkpoint,
} from "../../services/magenta-services";

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
    numberOfSamples: 2,
    similarity: 0.6,
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
  },
  // basiacally setters
  // using the ES2015 computed property name feature
  mutations: {},
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
     * Initialise the model to RNN
     */
    [MODEL_ACTION_INIT_RNN]({ state }) {
      let model = new music_rnn.MusicRNN(improv_checkpoint);
      model.initialize().then(() => {
        // console.log("rnn init done");
        state.magentaModel = model;
        state.isModelReady = true;
        // dispatch(SESSION_ACTION_GENERATE_CONTINUATION);
      });
    },

    [MODEL_ACTION_GENERATE_CONTINUATION]({ state }) {
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
    async [MODEL_ACTION_INIT_VAE]({ state }, minPitch, maxPitch) {
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
        // setting limits

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

    async [MODEL_ACTION_GENERATE_SIMILARS]({ state }, noteSequence) {
      state.isModelLoading = true;
      let samples = await state.magentaModel.similar(
        noteSequence,
        state.numberOfSamples,
        state.similarity
      );

      // console.log(samples);

      this.dispatch(SESSION_STORE_LOC + SESSION_ACTION_SET_AIMELODIES, samples);
      state.isModelLoading = false;
      // console.log("samples in model store: ", samples);
      // return samples; // this could be returned to session store
    },
  },
};
