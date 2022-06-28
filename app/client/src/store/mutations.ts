/* eslint-disable @typescript-eslint/no-explicit-any */
export default {
  setVersions(state: any, versioninfo: object) {
    state.versions = versioninfo;
  },
  setUser(state: any, userinfo: object) {
    state.user = userinfo;
  },
  addFile(state: any, input: Record<string, string>) {
    state.results.perIsolate[input.hash] = {
      hash: input.hash,
      filename: input.name,
      sketch: {},
      amr: {},
    };
    state.uploadedFiles += 1;
  },
  setSketch(state: any, sketchinfo: Record<string, never>) {
    state.results.perIsolate[sketchinfo.hash].sketch = sketchinfo.Sketch;
  },
  setAMR(state: any, amrinfo: Record<string, never>) {
    state.results.perIsolate[amrinfo.hash].amr = amrinfo.AMR_results;
  },
  setProjectHash(state: any, phash: string) {
    state.projectHash = phash;
  },
  setStatus(state: any, status: Record<string, any>) {
    state.analysisStatus = status.data;
  },
  setStatusInterval(state: any, interval: any) {
    state.statusInterval = interval;
  },
  setClusters(state: any, clusterInfo: Record<string, any>) {
    Object.keys(clusterInfo.data).forEach((element) => {
      state.results.perIsolate[clusterInfo.data[element].hash]
        .cluster = clusterInfo.data[element].cluster;
    });
  },
};
