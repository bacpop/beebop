import Vuex from 'vuex';
import actions from '@/store/actions';
import mutations from '@/store/mutations';
import { RootState } from '@/store/state';

export default new Vuex.Store<RootState>({
  state: {
    versions: [],
    user: null,
    uploadedFiles: 0,
    projectHash: null,
    analysisStatus: null,
    statusInterval: null,
    results: {
      perIsolate: {},
      perCluster: null,
    },
  },
  getters: {
  },
  mutations,
  actions,
  modules: {
  },
});
