import { createStore } from 'vuex';
import config from '@/resources/config.json';

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
  actions: {
    async getVersions({ commit }) {
      const response = await fetch(`${config.app_url}/version`);
      const data = await response.json();
      commit('setVersions', data.data);
    },
  },
  modules: {
  },
});
