import ProgressBar from '@/components/ProgressBar.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('Progress bar', () => {
  const analysisProgress = jest.fn().mockReturnValue(1 / 3);

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      analysisStatus: {
        assign: 'finished',
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
    expect(wrapper.find('.progress-bar').text()).toBe('33.33%');
  });
});

describe('Progress bar finished', () => {
  const analysisProgress = jest.fn().mockReturnValue(1);

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      analysisStatus: {
        assign: 'finished',
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
