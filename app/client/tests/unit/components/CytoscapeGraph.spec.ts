import CytoscapeGraph from '@/components/CytoscapeGraph.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('Component displays one button per unique cluster and one network graph', () => {
  const uniqueClusters = jest.fn().mockReturnValue([2, 4, 7, 31]);

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {
          2: {
            cluster: '2',
            graph: '<graph></graph>',
          },
        },
      },
    }),
    getters: {
      uniqueClusters,
    },
  });
  const wrapper = mount(CytoscapeGraph, {
    propsData: {
      cluster: 2,
    },
    global: {
      plugins: [store],
    },
  } as any);

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
