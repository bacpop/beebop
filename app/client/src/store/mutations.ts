import { Store } from 'vuex';

export default {
  setVersions(state:any, versioninfo:object) {
    state.versions = versioninfo;
  },
};
