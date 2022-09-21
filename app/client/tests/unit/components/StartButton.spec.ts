import StartButton from '@/components/StartButton.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('StartButton', () => {
  const runPoppunk = jest.fn();
  const getStatus = jest.fn();
  const getAssignResult = jest.fn();
  const setSubmitStatus = jest.fn();
  const setStatusInterval = jest.fn();
  const startStatusPolling = jest.fn();
  const submitData = jest.fn();

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
      runPoppunk,
      getStatus,
      getAssignResult,
      startStatusPolling,
      submitData,
    },
    mutations: {
      setSubmitStatus,
      setStatusInterval,
    },
  });
  const wrapper = mount(StartButton, {
    global: {
      plugins: [store],
    },

  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('onClick triggers actions', () => {
    wrapper.vm.onClick();
    expect(submitData).toHaveBeenCalledTimes(1);
  });
});

describe('StartButton disabled', () => {
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
          someHash2: {
            hash: 'someHash2',
            filename: 'example2.fa',
          },
        },
        perCluster: {},
      },
    }),
  });
  const wrapper = mount(StartButton, {
    global: {
      plugins: [store],
    },
  });

  it('disables Button when not all sketches are ready', () => {
    expect(wrapper.find('button').attributes('class')).toContain('disabled');
  });
});

describe('StartButton disabled after submit', () => {
  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      submitStatus: 'submitted',
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
          someHash2: {
            hash: 'someHash2',
            filename: 'example2.fa',
            sketch: 'sketch',
          },
        },
        perCluster: {},
      },
    }),
  });
  const wrapper = mount(StartButton, {
    global: {
      plugins: [store],
    },
  });

  it('disables Button when not all sketches are ready', () => {
    expect(wrapper.find('button').attributes('class')).toContain('disabled');
  });
});
