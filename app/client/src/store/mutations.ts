import { RootState } from '@/store/state';
import { Versions, User, IsolateValue } from '@/types';

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
};
