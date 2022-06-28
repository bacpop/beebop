import actions from '@/store/actions';
import versionInfo from '@/resources/versionInfo.json';
import { Md5 } from 'ts-md5/dist/md5';
import config from '../../src/resources/config.json';
import { mockRootState, mockAxios } from '../mocks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function responseSuccess(data : any) {
  return {
    status: 'success',
    errors: [],
    data: { data },
  };
}

describe('Actions', () => {
  mockAxios.onGet(`${config.server_url}/version`).reply(200, versionInfo);
  mockAxios.onGet(`${config.server_url}/user`).reply(200, responseSuccess({ id: '12345', name: 'Beebop', provider: 'google' }));
  mockAxios.onPost(`${config.server_url}/poppunk`).reply(200, 'job_id');
  mockAxios.onPost(`${config.server_url}/status`).reply(200, responseSuccess('finished'));
  mockAxios.onPost(`${config.server_url}/result`).reply(200, responseSuccess({ 0: { cluster: '75', hash: 'abc123def456' } }));

  it('getVersions fetches and commits version info', async () => {
    const commit = jest.fn();
    await actions.getVersions({ commit });

    expect(commit).toHaveBeenCalledWith(
      'setVersions',
      versionInfo,
    );
  });

  it('getUser fetches and commits user info', async () => {
    const commit = jest.fn();
    await actions.getUser({ commit });

    expect(commit).toHaveBeenCalledWith(
      'setUser',
      responseSuccess({ id: '12345', name: 'Beebop', provider: 'google' }),
    );
  });

  it('getStatus fetches and commits job status', async () => {
    const commit = jest.fn();
    const state = mockRootState();
    await actions.getStatus({ commit, state });

    expect(commit).toHaveBeenCalledWith(
      'setStatus',
      responseSuccess('finished'),
    );
  });

  it('getResults fetches and commits job results (so far just clusters)', async () => {
    const commit = jest.fn();
    const state = mockRootState();
    await actions.getResult({ commit, state });

    expect(commit).toHaveBeenCalledWith(
      'setClusters',
      responseSuccess({ 0: { cluster: '75', hash: 'abc123def456' } }),
    );
  });

  it('runPoppunk calculates phash and makes axios call', async () => {
    const commit = jest.fn();
    const state = mockRootState({ results: { perIsolate: { hash1: { sketch: '{}' }, hash2: { sketch: '{}' }, hash3: { sketch: '{}' } }, perCluster: null } });
    await actions.runPoppunk({ commit, state });

    expect(commit).toHaveBeenCalledWith(
      'setProjectHash',
      Md5.hashStr(['hash1', 'hash2', 'hash3'].sort().join()),
    );
  });
});
