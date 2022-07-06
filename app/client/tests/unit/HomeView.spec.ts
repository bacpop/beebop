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
          status: 'success',
          errors: [],
          data: {
            name: 'Jane',
            id: '543653d45',
            provider: 'google',
          },
        },
        results: {
          perIsolate: {},
        },
        uploadedFiles: 0,
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
    const buttons = wrapper.findAll('.btn-logout');
    expect(buttons.length).toBe(1);
    expect(buttons[0].text()).toBe('Logout');
    expect(wrapper.find('.dropzone').exists());
    expect(wrapper.find('.count').text()).toMatch('0');
  });
});
