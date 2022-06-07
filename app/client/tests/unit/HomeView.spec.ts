import { mount } from '@vue/test-utils';
import HomeView from '@/views/HomeView.vue';
import Vuex from 'vuex';
import { RootState } from '@/store/state';
import { mockRootState } from '../mocks';

describe('Home', () => {
  const getUser = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls getUser', () => {
    const store = new Vuex.Store<RootState>({
      state: mockRootState({
        user: {
          status: 'failure',
          errors: [],
          data: null,
        },
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
        user: {
          status: 'failure',
          errors: [],
          data: null,
        },
      }),
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

  it('shows logout button when logged in', () => {
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
      }),
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
  });

  it('shows Start Analysis button when files were submitted', () => {
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
        uploadedFiles: 3,
      }),
    });
    const wrapper = mount(HomeView, {
      global: {
        plugins: [store],
      },
    });
    const buttons = wrapper.findAll('.btn-standard');
    expect(buttons.length).toBe(2);
    expect(buttons[1].text()).toBe('Start Analysis');
  });

  it('shows analysis status once analysis was started', () => {
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
        uploadedFiles: 3,
        analysisStatus: 'started',
      }),
    });
    const wrapper = mount(HomeView, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.find('h5').text()).toMatch('Job status:');
  });
});
