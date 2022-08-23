import axios from 'axios';
import { Commit, ActionContext } from 'vuex';
import config from '@/resources/config.json';
import { Md5 } from 'ts-md5/dist/md5';
import { RootState } from '@/store/state';

axios.defaults.withCredentials = true;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function axiosJsonPost(endpoint: string, body: Record<string, any>) {
  return axios.post(
    `${config.server_url}/${endpoint}`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

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
    await axiosJsonPost('poppunk', { projectHash: phash, sketches: jsonSketches })
      .then(() => {
        commit('setAnalysisStatus', { assign: 'submitted', microreact: 'submitted', network: 'submitted' });
      });
  },
  async getStatus(context: ActionContext<RootState, RootState>) {
    const { state, dispatch, commit } = context;
    await axiosJsonPost('status', { hash: state.projectHash })
      .then((response) => {
        if (response.data.data.assign === 'finished' && state.analysisStatus.assign !== 'finished') {
          dispatch('getAssignResult');
        }
        commit('setAnalysisStatus', response.data.data);
        if ((response.data.data.network === 'finished' || response.data.data.network === 'failed') && (response.data.data.microreact === 'finished' || response.data.data.microreact === 'failed')) {
          clearInterval(state.statusInterval);
        }
      });
  },
  async getAssignResult({ commit, state }: { commit: Commit, state: RootState }) {
    await axiosJsonPost('assignResult', { projectHash: state.projectHash })
      .then((response) => {
        commit('setClusters', response.data);
      });
  },
  async startStatusPolling(context: ActionContext<RootState, RootState>) {
    const { dispatch, commit } = context;
    const inter = setInterval(() => { dispatch('getStatus'); }, 1000);
    commit('setStatusInterval', inter);
  },
};
