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

  test('has all 4 tabs and a graph element for first cluster', () => {
    expect(wrapper.findAll('.nav-link')).toHaveLength(4);
    expect(wrapper.findAll('.cytoscape-graph')).toHaveLength(1);
    const graphComponent = wrapper.findAllComponents('.cytoscape-graph')[0];
    expect(graphComponent.attributes('cluster')).toBe('2');
  });

  test('clicking on tabs changes the selected cluster', () => {
    const secondTabControl = wrapper.findAll('.nav-link')[1];
    expect(secondTabControl.text()).toBe('Cluster 4');
    expect(wrapper.vm.selectedCluster).toBe(2);
    secondTabControl.trigger('click');
    expect(wrapper.vm.selectedCluster).toBe(4);
  });
});
