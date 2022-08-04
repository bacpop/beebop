import actions from '@/store/actions';
import versionInfo from '@/resources/versionInfo.json';
import { Md5 } from 'ts-md5/dist/md5';
import config from '../../../src/resources/config.json';
import { mockAxios, mockRootState } from '../../mocks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function responseSuccess(data : any) {
  return {
    status: 'success',
    errors: [],
    data,
  };
}

class MockWorker implements Partial<Worker> {
  url: string

  onmessage: (msg: any) => any

  constructor(stringUrl: any) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg: any) {
    this.onmessage({ data: msg });
  }
}

(window as any).Worker = MockWorker;

describe('Actions', () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it('getVersions fetches and commits version info', async () => {
    mockAxios.onGet(`${config.server_url}/version`).reply(200, versionInfo);
    const commit = jest.fn();
    await actions.getVersions({ commit });

    expect(commit).toHaveBeenCalledWith(
      'setVersions',
      versionInfo,
    );
  });

  it('getUser fetches and commits user info', async () => {
    mockAxios.onGet(`${config.server_url}/user`).reply(200, responseSuccess({ id: '12345', name: 'Beebop', provider: 'google' }));
    const commit = jest.fn();
    await actions.getUser({ commit });

    expect(commit).toHaveBeenCalledWith(
      'setUser',
      responseSuccess({ id: '12345', name: 'Beebop', provider: 'google' }),
    );
  });

  it('logoutUser makes axios call', async () => {
    mockAxios.onGet(`${config.server_url}/logout`).reply(200);
    await actions.logoutUser();
    expect(mockAxios.history.get[0].url).toEqual(`${config.server_url}/logout`);
  });

  it('processFiles calculates filehash, adds hash & filename to store and calls setIsolateValue', async () => {
    const commit = jest.fn();
    const file = {
      name: 'sample.fa',
      text: () => Promise.resolve('ACGTGTAGTCTGACGTAAC'),
    };
    await actions.processFiles({ commit }, [file as any]);
    expect(commit.mock.calls[0]).toEqual([
      'addFile',
      { hash: '97f83117a2679651d4044b5ffdc5fd00', name: 'sample.fa' }]);
    expect(commit.mock.calls[1]).toEqual([
      'setIsolateValue',
      { hash: '97f83117a2679651d4044b5ffdc5fd00', fileObject: file }]);
  });

  it('runPoppunk makes axios call', async () => {
    const commit = jest.fn();
    const state = mockRootState({
      results: {
        perIsolate: {
          someFileHash: {
            sketch: '{"14":"12345"}',
          },
          someFileHash2: {
            sketch: '{"14":"12345"}',
          },
        },
      },
    });
    const expectedHash = Md5.hashStr(Object.keys(state.results.perIsolate).sort().join());
    mockAxios.onPost(`${config.server_url}/poppunk`).reply(200);
    await actions.runPoppunk({ commit, state });
    expect(mockAxios.history.post[0].url).toEqual(`${config.server_url}/poppunk`);
    expect(commit.mock.calls[0]).toEqual([
      'setProjectHash',
      expectedHash]);
    expect(commit.mock.calls[1]).toEqual([
      'setStatus',
      { task: 'assign', data: 'submitted' }]);
  });

  it('getStatus makes axios call and updates analysisStatus', async () => {
    const commit = jest.fn();
    const state = mockRootState({
      projectHash: 'randomHash',
      analysisStatus: {
        submitted: 'submitted',
        assign: 'started',
        microreact: 'waiting',
        network: 'waiting',
      },
    });
    mockAxios.onPost(`${config.server_url}/status`).reply(200, responseSuccess({
      submitted: 'submitted', assign: 'finished', microreact: 'started', network: 'queued',
    }));
    await actions.getStatus({ commit, state });
    expect(mockAxios.history.post[0].url).toEqual(`${config.server_url}/status`);
    expect(commit.mock.calls[0]).toEqual([
      'setStatus',
      {
        task: 'microreact',
        data: 'started',
      },
    ]);
    expect(commit.mock.calls[1]).toEqual([
      'setStatus',
      {
        task: 'network',
        data: 'queued',
      },
    ]);
  });

  it('getAssignResult makes axios call and updates clusters', async () => {
    const commit = jest.fn();
    const state = mockRootState({
      projectHash: 'randomHash',
      results: {
        perIsolate: {
          someFileHash: {
            hash: 'someFileHash',
          },
          someFileHash2: {
            hash: 'someFileHash2',
          },
        },
      },
    });
    const expResponse = responseSuccess({ 0: { hash: 'someFileHash', cluster: '12' }, 1: { hash: 'someFileHash2', cluster: '2' } });
    mockAxios.onPost(`${config.server_url}/assignResult`).reply(200, expResponse);
    await actions.getAssignResult({ commit, state });
    expect(mockAxios.history.post[0].url).toEqual(`${config.server_url}/assignResult`);
    expect(commit.mock.calls[0]).toEqual([
      'setClusters',
      expResponse,
    ]);
  });
});
