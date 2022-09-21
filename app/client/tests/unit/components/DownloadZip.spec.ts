import DownloadZip from '@/components/DownloadZip.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('DownloadZip button', () => {
  const getZip = jest.fn();
  const uniqueClusters = jest.fn();

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      user: {
        name: 'Jane',
        id: '543653d45',
        provider: 'google',
      },
      results: {
        perIsolate: {
          someHash: {
            hash: 'someHash',
            filename: 'example.fa',
            sketch: 'sketch',
          },
        },
        perCluster: {},
      },
    }),
    actions: {
      getZip,
    },
    getters: {
      uniqueClusters,
    },
  });
  const wrapper = mount(DownloadZip, {
    global: {
      plugins: [store],
    },
  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
  it('onClick triggers action to download zip data', () => {
    wrapper.vm.onClick();
    expect(getZip).toHaveBeenCalledTimes(1);
  });
});
