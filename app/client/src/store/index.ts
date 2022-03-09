import { createStore } from 'vuex';
import actions from '@/store/actions';

export default createStore({
  state: {
    versions: [],
  },
  getters: {
  },
  mutations: {
    setVersions(state, versioninfo) {
      state.versions = versioninfo;
    },
  },
  actions,
  modules: {
  },
});
