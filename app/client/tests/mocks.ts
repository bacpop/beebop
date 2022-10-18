import { RootState } from '@/store/state';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  ResponseFailure, ResponseSuccess, BeebopError,
} from '../src/types';

export const mockAxios = new MockAdapter(axios);

export function mockRootState(state: Partial<RootState> = {}): RootState {
  return {
    errors: [],
    versions: [],
    user: null,
    microreactToken: null,
    results: {
      perIsolate: {},
      perCluster: {},
    },
    submitStatus: null,
    analysisStatus: {
      assign: null, microreact: null, network: null,
    },
    statusInterval: undefined,
    projectHash: null,
    ...state,
  };
}

export const mockSuccess = (data: any): ResponseSuccess => ({
  data,
  status: 'success',
  errors: null,
});

export const mockError = (errorMessage = 'some message'): BeebopError => ({ error: 'OTHER_ERROR', detail: errorMessage });

export const mockFailure = (errorMessage: string): ResponseFailure => ({
  data: null,
  status: 'failure',
  errors: [mockError(errorMessage)],
});
