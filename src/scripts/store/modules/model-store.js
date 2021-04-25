/**
 * MODEL STORE
 */
import {
  MODEL_ACTION_INIT_RNN,
  MODEL_ACTION_INIT_VAE,
  MODEL_ACTION_GENERATE_CONTINUATION,
  MODEL_ACTION_GENERATE_SIMILARS,
} from "../actions";
import {
  improv_checkpoint,
  musicVAE_checkpoint_2bar,
  musicVAE_checkpoint_med_4bar,
  musicVAE_checkpoint,
} from "../../services/magenta-services";

const ModelConfigJSON = {
  type: "MusicVAE",
  dataConverter: {
    type: "MelodyConverter",
    args: {
      numSteps: 256,
      numSegments: 16,
      minPitch: 60,
      maxPitch: 72,
    },
  },
};

export default {
  namespaced: true,
  state: () => ({
    magentaModel: null, // new
    isModelReady: false,

    // game level specific values
    numberOfSamples: 2,
    similarity: 0.9,
  }),

  getters: {
    magentaModel(state) {
      return state.magentaModel;
    },
    isModelReady(state) {
      return state.isModelReady;
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
        console.log("rnn init done");
        state.magentaModel = model;
        state.isModelReady = true;
        // dispatch(SESSION_ACTION_GENERATE_CONTINUATION);
      });
    },

    [MODEL_ACTION_GENERATE_CONTINUATION]({ state }) {
      state.magentaModel
        .continueSequence(sampleSequence, 60, 0.5, ["CM"])
        .then((resp) => {
          console.log(resp);
          // state.player.start(resp);
        });
    },

    /**
     * Initialise the model to VAE
     */
    async [MODEL_ACTION_INIT_VAE]({ state }) {
      // check for model in localstorage
      // let lc_model = localStorage.getItem('model_VAE');
      // if(lc_model) {
      //   try {
      //     // save to store
      //     console.log(JSON.parse(lc_model));
      //     state.magentaModel =  new music_vae.MusicVAE(JSON.parse(lc_model));
      //     console.log(state.magentaModel);
      //     state.isModelReady = true;
      //     console.log("model loaded from local storage..")
      //     return;
      //   } catch (error) {
      //     // continues to creating new model
      //   }
      // }

      // // trying to use downloaded model
      // let model = new music_vae.MusicVAE("src/model-checkpoint");
      // model.initialize().then(() => {
      let model = new music_vae.MusicVAE(musicVAE_checkpoint_med_4bar); //ModelConfigJSON
      await model.initialize();
      // console.log('before',model.spec.dataConverter.args)
      // console.log(model);
      // setting limits
      model.spec.dataConverter.args.maxPitch = 72;
      model.spec.dataConverter.args.minPitch = 60;

      // could we store in lc?
      // localStorage.setItem('model_VAE', JSON.stringify(model));
      state.magentaModel = model;
      console.log("vae init done");

      setTimeout(() => {
        state.isModelReady = true;
        console.log('fadeout complete, element removed');
      }, 500);
    },

    async [MODEL_ACTION_GENERATE_SIMILARS]({ state }, noteSequence) {
      let samples = await state.magentaModel.similar(
        noteSequence,
        state.numberOfSamples,
        state.similarity
      );
      // console.log("samples in model store: ", samples);
      return samples; // this will be returned to session store?
    },
  },
};
