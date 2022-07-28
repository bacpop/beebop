import { RootState } from '@/store/state';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export const mockAxios = new MockAdapter(axios);

export function mockRootState(state: Partial<RootState> = {}): RootState {
  return {
    versions: [],
    user: null,
    results: { perIsolate: {} },
    analysisStatus: { submitted: null },
    projectHash: null,
    ...state,
  };
}
