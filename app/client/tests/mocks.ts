import { RootState } from '@/store/state';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export const mockAxios = new MockAdapter(axios);

export function mockRootState(state: Partial<RootState> = {}): RootState {
  return {
    versions: [],
    user: null,
    uploadedFiles: 0,
    results: { perIsolate: {}, perCluster: null },
    projectHash: null,
    analysisStatus: null,
    statusInterval: null,
    ...state,
  };
}
