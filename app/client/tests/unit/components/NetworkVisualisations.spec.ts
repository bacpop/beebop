import NetworkVisualisations from '@/components/NetworkVisualisations.vue';
import { shallowMount } from '@vue/test-utils';
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
  const wrapper = shallowMount(NetworkVisualisations, {
    propsData: {
      firstCluster: 2,
    },
    global: {
      plugins: [store],
    },
  } as any);

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('has all buttons and a graph element with class column90', () => {
    expect(wrapper.findAll('.columnButtons')).toHaveLength(4);
    expect(wrapper.findAll('.column90')).toHaveLength(1);
    const graphComponent = wrapper.findAll('.column90')[0];
    expect(graphComponent.attributes('cluster')).toBe('2');
  });

  test('clicking buttons changes the selected cluster', () => {
    const button = wrapper.findAll('.columnButtons')[1];
    expect(button.text()).toBe('Cluster 4');
    expect(wrapper.vm.selectedCluster).toBe(2);
    button.trigger('click');
    expect(wrapper.vm.selectedCluster).toBe(4);
  });
});
