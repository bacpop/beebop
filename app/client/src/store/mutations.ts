export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setVersions(state: any, versioninfo: object) {
    state.versions = versioninfo;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUser(state: any, userinfo: object) {
    state.user = userinfo;
  },
};
