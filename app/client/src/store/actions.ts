import axios from 'axios';
import { Commit, ActionContext } from 'vuex';
import config from '@/resources/config.json';
import { Md5 } from 'ts-md5/dist/md5';
import { RootState } from '@/store/state';
import {
  Versions, User, AnalysisStatus, ClusterInfo, Dict,
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
    // generate filenameMapping that the backend can use to replace
    // filehashes with filenames in results.
    // Also generate a string of ordered hashes and corresponding filenames
    // to be used to generate a projecthash that is unique to this combination
    // of file contents and filenames
    const filenameMapping = {} as Dict<string>;
    let mappingOrdered = '';
    Object.keys(state.results.perIsolate).sort().forEach((filehash) => {
      // disabling this rule here since this should always have a value
      // since the action can only be triggered when files have been uploaded:
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      filenameMapping[filehash] = state.results.perIsolate[filehash].filename!;
      mappingOrdered += filehash;
      mappingOrdered += state.results.perIsolate[filehash].filename;
    });
    const phash = Md5.hashStr(mappingOrdered);
    commit('setProjectHash', phash);
    // add all sketches to object
    const jsonSketches = {} as Dict<Dict<string>>;
    Object.keys(state.results.perIsolate).forEach((element) => {
      jsonSketches[element] = JSON.parse(state.results.perIsolate[element].sketch as string);
    });
    const response = await api(context)
      .withError('addError')
      .ignoreSuccess()
      .post<AnalysisStatus>(`${config.server_url}/poppunk`, {
        projectHash: phash,
        sketches: jsonSketches,
        names: filenameMapping,
      });
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
    await dispatch('runPoppunk');
    commit('setSubmitStatus', 'submitted');
    dispatch('startStatusPolling');
  },
  async getZip(
    context: ActionContext<RootState, RootState>,
    data: Record<string, string | number>,
  ) {
    const { state } = context;
    await axios.post(
      `${config.server_url}/downloadZip`,
      {
        type: data.type,
        cluster: data.cluster,
        projectHash: state.projectHash,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      },
    )
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/zip' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${data.type}_cluster${data.cluster}.zip`;
        link.click();
      });
  },
  async buildMicroreactURL(
    context: ActionContext<RootState, RootState>,
    data: Record<string, string | number>,
  ) {
    const { state, commit } = context;
    commit('setToken', data.token);
    await api(context)
      .withSuccess('addMicroreactURL')
      .withError('addError')
      .post<ClusterInfo>(`${config.server_url}/microreactURL`, {
        cluster: data.cluster,
        projectHash: state.projectHash,
        apiToken: state.microreactToken,
      });
  },
  async getGraphml(
    context: ActionContext<RootState, RootState>,
    cluster: string | number,
  ) {
    const { state } = context;
    await api(context)
      .withSuccess('addGraphml')
      .withError('addError')
      .post<ClusterInfo>(`${config.server_url}/downloadGraphml`, {
        cluster,
        projectHash: state.projectHash,
      });
  },
};
