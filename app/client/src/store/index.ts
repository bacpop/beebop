import Vuex from 'vuex';
import actions from '@/store/actions';
import mutations from '@/store/mutations';
import { RootState } from '@/store/state';

export default new Vuex.Store<RootState>({
  state: {
    versions: [],
    user: null,
    results: {
      perIsolate: {},
    },
    projectHash: null,
    analysisStatus: {
      submitted: null,
      assign: null,
      microreact: null,
      network: null,
    },
    statusInterval: null,
  },
  getters: {
  },
  mutations,
  actions,
  modules: {
  },
});
