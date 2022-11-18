import ProgressBar from '@/components/ProgressBar.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('Progress bar', () => {
  const analysisProgress = jest.fn().mockReturnValue({
    finished: 1,
    progress: 0.25,
    total: 4,
  });

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      analysisStatus: {
        assignClusters: 'finished',
        assignLineages: 'queued',
        microreact: 'queued',
        network: 'started',
      },
    }),
    getters: {
      analysisProgress,
    },
  });
  const wrapper = mount(ProgressBar, {
    global: {
      plugins: [store],
    },

  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('gets analysisProgress and displays status', () => {
    expect(analysisProgress).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.animated).toBe(true);
    expect(wrapper.find('.progress-bar').text()).toBe('25.00%');
  });
});

describe('Progress bar finished', () => {
  const analysisProgress = jest.fn().mockReturnValue({
    finished: 4,
    progress: 1,
    total: 4,
  });

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      analysisStatus: {
        assignClusters: 'finished',
        assignLineages: 'finished',
        microreact: 'finished',
        network: 'finished',
      },
    }),
    getters: {
      analysisProgress,
    },
  });
  const wrapper = mount(ProgressBar, {
    global: {
      plugins: [store],
    },

  });

  it('animated is set to false when all analyses finished', () => {
    expect(wrapper.vm.animated).toBe(false);
    expect(wrapper.find('.progress-bar').text()).toBe('100.00%');
  });
});
