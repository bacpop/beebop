import { mount } from '@vue/test-utils';
import HomeView from '@/views/HomeView.vue';
import Vuex from 'vuex';
import { RootState } from '@/store/state';
import { mockRootState } from '../../mocks';

describe('Home', () => {
  const getUser = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls getUser', () => {
    const store = new Vuex.Store<RootState>({
      state: mockRootState({
        user: null,
      }),
      actions: {
        getUser,
      },
    });
    mount(HomeView, {
      global: {
        plugins: [store],
      },
    });
    expect(getUser).toHaveBeenCalled();
  });

  it('shows login buttons when not logged in', () => {
    const store = new Vuex.Store<RootState>({
      state: mockRootState({
        user: null,
      }),
      actions: {
        getUser,
      },
    });
    const wrapper = mount(HomeView, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.find('h1').text()).toMatch('Welcome to beebop!');
    const socialButtons = wrapper.findAll('.btn-social');
    expect(socialButtons.length).toBe(2);
    expect(socialButtons[0].text()).toBe('Login with Google');
    expect(socialButtons[1].text()).toBe('Login with Github');
  });

  it('shows logout button and dropzone when logged in', () => {
    const store = new Vuex.Store<RootState>({
      state: mockRootState({
        user: {
          name: 'Jane',
          id: '543653d45',
          provider: 'google',
        },
        results: {
          perIsolate: {},
        },
      }),
      actions: {
        getUser,
      },
    });
    const wrapper = mount(HomeView, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.find('h1').text()).toMatch('Welcome to beebop!');
    const buttons = wrapper.findAll('.btn-standard');
    expect(buttons.length).toBe(1);
    expect(buttons[0].text()).toBe('Logout');
    expect(wrapper.find('.dropzone').exists());
    expect(wrapper.find('.count').text()).toMatch('0');
  });

  it('shows start Analysis button when files are uploaded', () => {
    const store = new Vuex.Store<RootState>({
      state: mockRootState({
        user: {
          name: 'Jane',
          id: '543653d45',
          provider: 'google',
        },
        results: {
          perIsolate: {
            someFileHash: {},
            someFileHash2: {},
          },
        },
        submitStatus: null,
        analysisStatus: {
          assign: null, microreact: null, network: null,
        },
      }),
      actions: {
        getUser,
      },
    });
    const wrapper = mount(HomeView, {
      global: {
        plugins: [store],
      },
    });
    const buttons = wrapper.findAll('.btn');
    expect(buttons.length).toBe(2);
    expect(buttons[1].text()).toBe('Start Analysis');
  });

  it('shows status bar when data was submitted to backend', () => {
    const analysisProgress = jest.fn().mockReturnValue(1 / 3);
    const store = new Vuex.Store<RootState>({
      state: mockRootState({
        user: {
          name: 'Jane',
          id: '543653d45',
          provider: 'google',
        },
        results: {
          perIsolate: {
            someFileHash: {},
            someFileHash2: {},
          },
        },
        submitStatus: 'submitted',
        analysisStatus: {
          assign: 'finished', microreact: 'started', network: 'queued',
        },
      }),
      actions: {
        getUser,
      },
      getters: {
        analysisProgress,
      },
    });
    const wrapper = mount(HomeView, {
      global: {
        plugins: [store],
      },
    });
    const statusBar = wrapper.findAll('.progress');
    expect(analysisProgress).toHaveBeenCalled();
    expect(statusBar.length).toBe(1);
    expect(statusBar[0].text()).toBe('33.33%');
  });
});
