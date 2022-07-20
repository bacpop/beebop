import actions from '@/store/actions';
import versionInfo from '@/resources/versionInfo.json';
import config from '../../../src/resources/config.json';
import { mockAxios } from '../../mocks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function responseSuccess(data : any) {
  return {
    status: 'success',
    errors: [],
    data: { data },
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
});
