import axios from 'axios';
import { Commit } from 'vuex';
import config from '@/resources/config.json';
import { Md5 } from 'ts-md5/dist/md5';
import { RootState } from '@/store/state';

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
  async processFiles({ commit } : { commit: Commit }, acceptFiles: Array<File>) {
    function readContent(file: File) {
      return file.text();
    }
    acceptFiles.forEach((file: File) => {
      readContent(file)
        .then((content: string) => {
          const fileHash = Md5.hashStr(content);
          commit('addFile', { hash: fileHash, name: file.name });
          const worker = new Worker('./worker.js');
          worker.onmessage = (event) => {
            commit('setIsolateValue', event.data);
          };
          worker.postMessage({ hash: fileHash, fileObject: file });
        });
    });
  },
  async runPoppunk({ commit, state }: { commit: Commit, state: RootState }) {
    const jsonSketches = {} as { [key: string]: Record<string, never> };
    // join all file hashes to create a project hash
    const phash = Md5.hashStr(Object.keys(state.results.perIsolate).sort().join());
    commit('setProjectHash', phash);
    Object.keys(state.results.perIsolate).forEach((element) => {
      jsonSketches[element] = JSON.parse(state.results.perIsolate[element].sketch as string);
    });
    await axios.post(
      `${config.server_url}/poppunk`,
      { projectHash: phash, sketches: jsonSketches },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then(() => {
      commit('setStatus', { task: 'assign', data: 'submitted' });
      commit('setStatus', { task: 'microreact', data: 'submitted' });
      commit('setStatus', { task: 'network', data: 'submitted' });
    });
  },
};
