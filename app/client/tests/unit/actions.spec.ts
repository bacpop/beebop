import actions from '@/store/actions';
import versionInfo from '@/resources/versionInfo.json';
import config from '../../src/resources/config.json';
import { mockAxios } from '../mocks';

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

  it('processFiles calculates filehash and adds hash & filename to store', async () => {
    const commit = jest.fn();
    const file = {
      name: 'sample.fa',
      text: () => Promise.resolve('ACGTGTAGTCTGACGTAAC'),
    };
    await actions.processFiles({ commit }, [file as any]);
    expect(commit).toHaveBeenCalledWith(
      'addFile',
      { hash: '97f83117a2679651d4044b5ffdc5fd00', name: 'sample.fa' },
    );
  });
});
