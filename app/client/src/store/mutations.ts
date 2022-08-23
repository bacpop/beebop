import { RootState } from '@/store/state';
import {
  Versions, User, IsolateValue, AnalysisStatus, ClusterInfo,
} from '@/types';

export default {
  setVersions(state: RootState, versioninfo: Versions) {
    state.versions = versioninfo;
  },
  setUser(state: RootState, userinfo: User) {
    state.user = userinfo;
  },
  addFile(state: RootState, input: Record<string, string>) {
    if (!state.results.perIsolate[input.hash]) {
      state.results.perIsolate[input.hash] = {
        hash: input.hash,
        filename: input.name,
      };
    }
  },
  setIsolateValue(state: RootState, input: IsolateValue) {
    state.results.perIsolate[input.hash][input.type] = input.result;
  },
  setProjectHash(state: RootState, phash: string) {
    state.projectHash = phash;
  },
  setSubmitStatus(state: RootState, data: string) {
    state.submitStatus = data;
  },
  setAnalysisStatus(state: RootState, data: AnalysisStatus) {
    state.analysisStatus = data;
  },
  setStatusInterval(state: RootState, interval: number) {
    state.statusInterval = interval;
  },
  setClusters(state: RootState, clusterInfo: ClusterInfo) {
    Object.keys(clusterInfo.data).forEach((element) => {
      state.results.perIsolate[clusterInfo.data[element].hash]
        .cluster = clusterInfo.data[element].cluster;
    });
  },
};
