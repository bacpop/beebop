// Mock the import of cytoscape
import cytoscape from "cytoscape";

const mockReady = jest.fn();
const mockGraphMl = jest.fn();
const mockCytoscape = jest.fn().mockReturnValue({
  ready: mockReady,
  graphml: mockGraphMl
});

jest.mock('cytoscape', () => mockCytoscape);


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

  const getWrapper = () => {
    return mount(CytoscapeGraph, {
      propsData: {
        cluster: 2,
      },
      global: {
        plugins: [store],
      },
    } as any);
  }


  test('does a wrapper exist', () => {
    const wrapper = getWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  test('cytoscape methods called as expected', () => {
    jest.resetAllMocks();
    getWrapper();

    expect(mockCytoscape).toHaveBeenCalledTimes(1);
    expect(mockCytoscape.mock.calls[0][0]).toStrictEqual({
      container: this.$refs.cy as HTMLElement,
      style: [
        {
          selector: 'node',
          style: {
            width: '10px',
            height: '10px',
            content: 'data(key0)',
            'font-size': '7px',
            'background-color': 'darkblue',
            'border-style': 'solid',
            'border-color': 'black',
            'border-width': '1px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: '2px',
            'line-color': 'steelblue',
          },
        },
      ],
      layout: {
        name: 'grid',
      },
    });
    expect(mockReady).toHaveBeenCalledTimes(1);

    // Expect that calling the method passed to ready as a parameter will in turn call graphml
    const readyParam = mockReady.mock.calls[0][0];
    readyParam();
    expect(mockGraphMl).toHaveBeenCalledTimes(2);
    expect(mockGraphMl.mock.calls[0][0]).toStrictEqual({ layoutBy: 'cose' });
    expect(mockGraphMl.mock.calls[0][0]).toStrictEqual({
      graph: {
        cluster: '2',
        graph: '<graph></graph>',
      }
    });
  });
});
