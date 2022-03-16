import axios from 'axios';
import { Commit } from 'vuex';
import config from '@/resources/config.json';

export default {
  async getVersions({ commit } : {commit:Commit}) {
    await axios.get(`${config.app_url}/version`)
      .then((response) => {
        commit('setVersions', response.data);
      });
  },
};
