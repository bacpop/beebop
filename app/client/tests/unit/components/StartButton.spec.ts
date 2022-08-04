import StartButton from '@/components/StartButton.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('StartButton', () => {
  const runPoppunk = jest.fn();
  const getStatus = jest.fn();
  const getAssignResult = jest.fn();
  const setStatus = jest.fn();
  const setStatusInterval = jest.fn();
  const stopUpdateStatus = jest.fn();

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      user: {
        status: 'success',
        errors: [],
        data: {
          name: 'Jane',
          id: '543653d45',
          provider: 'google',
        },
      },
      results: {
        perIsolate: {
          someHash: {
            hash: 'someHash',
            filename: 'example.fa',
            sketch: 'sketch',
          },
        },
      },
    }),
    actions: {
      runPoppunk,
      getStatus,
      getAssignResult,
    },
    mutations: {
      setStatus,
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
    expect(runPoppunk).toHaveBeenCalledTimes(1);
    expect(setStatus.mock.calls[0][1]).toStrictEqual({ task: 'submitted', data: 'submitted' });
    expect(setStatusInterval).toHaveBeenCalledTimes(1);
    expect(setStatusInterval).toHaveBeenCalledWith(store.state, expect.any(Number));
  });

  it('watcher requests results when assign results are finished', () => {
    const updatedAnalysisStatus = {
      submitted: 'submitted',
      assign: 'finished',
      microreact: 'started',
      network: 'queued',
    };
      // wrapper.vm.$options.watch?.analysisStatus.handler.call(wrapper.vm, updatedAnalysisStatus);
      // expect(getAssignResult).toHaveBeenCalledTimes(1);
  });

  it('watcher stops updating status when all results are finished', () => {
    expect(getAssignResult).toHaveBeenCalledTimes(1);
    const finishedAnalysisStatus = {
      submitted: 'submitted',
      assign: 'finished',
      microreact: 'finished',
      network: 'finished',
    };
      // wrapper.vm.$options.watch?.analysisStatus.handler.call(wrapper.vm, finishedAnalysisStatus);
      // expect(stopUpdateStatus).toHaveBeenCalledTimes(1);
  });
});

describe('Dropzone', () => {
  const runPoppunk = jest.fn();
  const getStatus = jest.fn();
  const getAssignResult = jest.fn();
  const setStatus = jest.fn();
  const setStatusInterval = jest.fn();

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      user: {
        status: 'success',
        errors: [],
        data: {
          name: 'Jane',
          id: '543653d45',
          provider: 'google',
        },
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
      },
    }),
    actions: {
      runPoppunk,
      getStatus,
      getAssignResult,
    },
    mutations: {
      setStatus,
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

  it('disables Button when not all sketches are ready', () => {
    expect(wrapper.find('button').attributes('class')).toContain('disabled');
  });
});
