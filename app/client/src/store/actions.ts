import axios from 'axios';
import { Commit, ActionContext } from 'vuex';
import config from '@env/config.json';
import { Md5 } from 'ts-md5/dist/md5';
import { RootState } from '@/store/state';
import {
  Versions, User, AnalysisStatus, ClusterInfo,
} from '@/types';
import { api } from '../apiService';

axios.defaults.withCredentials = true;

export default {
  async getVersions(context: ActionContext<RootState, RootState>) {
    await api(context)
      .withSuccess('setVersions')
      .withError('addError')
      .get<Versions>(`${config.server_url}/version`);
  },
  async getUser(context: ActionContext<RootState, RootState>) {
    await api(context)
      .withSuccess('setUser')
      .withError('addError')
      .get<User>(`${config.server_url}/user`);
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
  async runPoppunk(context: ActionContext<RootState, RootState>) {
    const { state, commit } = context;
    const jsonSketches = {} as { [key: string]: Record<string, never> };
    // join all file hashes to create a project hash
    const phash = Md5.hashStr(Object.keys(state.results.perIsolate).sort().join());
    commit('setProjectHash', phash);
    Object.keys(state.results.perIsolate).forEach((element) => {
      jsonSketches[element] = JSON.parse(state.results.perIsolate[element].sketch as string);
    });
    const response = await api(context)
      .withError('addError')
      .ignoreSuccess()
      .post<AnalysisStatus>(`${config.server_url}/poppunk`, { projectHash: phash, sketches: jsonSketches });
    if (response) {
      commit('setAnalysisStatus', { assign: 'submitted', microreact: 'submitted', network: 'submitted' });
    }
  },
  async getStatus(context: ActionContext<RootState, RootState>) {
    const { state, dispatch } = context;
    const prevAssign = state.analysisStatus.assign;
    const response = await api(context)
      .withSuccess('setAnalysisStatus')
      .withError('addError')
      .post<AnalysisStatus>(`${config.server_url}/status`, { hash: state.projectHash });
    if (response) {
      if (response.data.assign === 'finished' && prevAssign !== 'finished') {
        dispatch('getAssignResult');
      }
      if ((response.data.network === 'finished' || response.data.network === 'failed')
        && (response.data.microreact === 'finished' || response.data.microreact === 'failed')) {
        clearInterval(state.statusInterval);
      }
    }
    if (!response) {
      clearInterval(state.statusInterval);
    }
  },
  async getAssignResult(context: ActionContext<RootState, RootState>) {
    const { state } = context;
    await api(context)
      .withSuccess('setClusters')
      .withError('addError')
      .post<ClusterInfo>(`${config.server_url}/assignResult`, { projectHash: state.projectHash });
  },
  async startStatusPolling(context: ActionContext<RootState, RootState>) {
    const { dispatch, commit } = context;
    const inter = setInterval(() => { dispatch('getStatus'); }, 1000);
    commit('setStatusInterval', inter);
  },
  async submitData(context: ActionContext<RootState, RootState>) {
    const { dispatch, commit } = context;
    dispatch('runPoppunk');
    commit('setSubmitStatus', 'submitted');
    dispatch('startStatusPolling');
  },
};
