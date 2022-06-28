import axios from 'axios';
import { Commit } from 'vuex';
import { Md5 } from 'ts-md5/dist/md5';
import config from '@/resources/config.json';
import { RootState } from './state';

axios.defaults.withCredentials = true;

export default {
  async getVersions({ commit }: { commit: Commit }) {
    await axios.get(`${config.server_url}/version`)
      .then((response) => {
        commit('setVersions', response.data);
      });
  },
  async getUser({ commit }: { commit: Commit }) {
    await axios.get(`${config.server_url}/user`)
      .then((response) => {
        commit('setUser', response.data);
      });
  },
  async logoutUser() {
    await axios.get(`${config.server_url}/logout`);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async runPoppunk({ commit, state }: { commit: Commit, state: any }) {
    const jsonSketches = {} as { [key: string]: Record<string, never> };
    // join all file hashes to create a project hash
    const phash = Md5.hashStr(Object.keys(state.results.perIsolate).sort().join());
    commit('setProjectHash', phash);
    Object.keys(state.results.perIsolate).forEach((element) => {
      jsonSketches[element] = JSON.parse(state.results.perIsolate[element].sketch);
    });
    await axios.post(
      `${config.server_url}/poppunk`,
      { projectHash: phash, sketches: jsonSketches },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  },
  async getStatus({ commit, state }: { commit: Commit, state: RootState }) {
    await axios.post(
      `${config.server_url}/status`,
      { hash: state.projectHash },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then((response) => {
        commit('setStatus', response.data);
      });
  },
  async getResult({ commit, state }: { commit: Commit, state: RootState }) {
    await axios.post(
      `${config.server_url}/result`,
      { hash: state.projectHash },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then((response) => {
        commit('setClusters', response.data);
      });
  },
};
