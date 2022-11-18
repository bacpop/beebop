import Vuex from 'vuex';
import actions from '@/store/actions';
import mutations from '@/store/mutations';
import { getters } from '@/store/getters';
import { RootState } from '@/store/state';

export default new Vuex.Store<RootState>({
  state: {
    errors: [],
    versions: [],
    user: null,
    microreactToken: null,
    results: {
      perIsolate: {},
      perCluster: {},
    },
    projectHash: null,
    submitStatus: null,
    analysisStatus: {
      assignClusters: null,
      assignLineages: null,
      microreact: null,
      network: null,
    },
    statusInterval: undefined,
  },
  getters,
  mutations,
  actions,
  modules: {
  },
});
