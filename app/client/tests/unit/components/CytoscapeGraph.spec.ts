// Mock the import of cytoscape
jest.mock('cytoscape', () => jest.fn().mockReturnValue({
    ready: jest.fn(),
  }));

import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import CytoscapeGraph from '@/components/CytoscapeGraph.vue';
import { mockRootState } from '../../mocks';

describe('Component calls getGraph when graph data not yet stored', () => {
  const getGraphml = jest.fn();

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {
          2: {
            cluster: '2',
          },
        },
      },
    }),
    actions: {
      getGraphml,
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

  test('drawGraph() and getGraph() are called', () => {
    expect(getGraphml).toHaveBeenCalledTimes(1);
  });
});

describe('Component calls cytoscape.ready()', () => {
  const getGraphml = jest.fn();

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
    actions: {
      getGraphml,
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

  test('cytoscape.ready() gets called', () => {
  });
});
