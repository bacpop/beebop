export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setVersions(state: any, versioninfo: object) {
    state.versions = versioninfo;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser(state: any, userinfo: object) {
    state.user = userinfo;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addFile(state: any, input: Record<string, string>) {
    if (!state.results.perIsolate[input.hash]) {
      state.results.perIsolate[input.hash] = {
        hash: input.hash,
        filename: input.name,
        sketch: {},
        amr: {},
      };
      state.uploadedFiles += 1;
    }
  },
};
