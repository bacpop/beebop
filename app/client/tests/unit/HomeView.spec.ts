import { mount } from '@vue/test-utils';
import HomeView from '@/views/HomeView.vue';
import { createStore } from 'vuex';

describe('Home', () => {
  const getUser = jest.fn();

  const storeLoggedIn = createStore({
    state() {
      return {
        user: {
          status: 'success',
          errors: [],
          data: {
            name: 'Jane',
            id: '543653d45',
            provider: 'google',
          },
        },
      };
    },
    actions: {
      getUser,
    },
  });

  const storeLoggedOut = createStore({
    state() {
      return {
        user: {
          status: 'failure',
          errors: [],
          data: null,
        },
      };
    },
    actions: {
      getUser,
    },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls getUser', () => {
    mount(HomeView, {
      global: {
        plugins: [storeLoggedOut],
      },
    });
    expect(getUser).toHaveBeenCalled();
  });

  it('shows login buttons when not logged in', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [storeLoggedOut],
      },
    });
    expect(wrapper.find('h1').text()).toMatch('Welcome to beebop!');
    const socialButtons = wrapper.findAll('.btn-social');
    expect(socialButtons.length).toBe(2);
    expect(socialButtons[0].text()).toBe('Login with Google');
    expect(socialButtons[1].text()).toBe('Login with Github');
  });

  it('shows logout button when logged in', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [storeLoggedIn],
      },
    });
    expect(wrapper.find('h1').text()).toMatch('Welcome to beebop!');
    const versions = wrapper.findAll('.btn-logout');
    expect(versions.length).toBe(1);
    expect(versions[0].text()).toBe('Logout');
  });
});
