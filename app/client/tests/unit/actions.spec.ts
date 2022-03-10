import actions from '@/store/actions';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import versionInfo from '@/resources/versionInfo.json';
import config from '../../src/resources/config.json';

describe('Actions', () => {
  const mock = new MockAdapter(axios);

  mock.onGet(`${config.app_url}/version`).reply(200, versionInfo);

  it('getVersions', async () => {
    const commit = jest.fn();
    await actions.getVersions({ commit });

    expect(commit).toHaveBeenCalledWith(
      'setVersions',
      versionInfo,
    );
  });
});
