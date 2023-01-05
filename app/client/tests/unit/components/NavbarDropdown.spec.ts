import NavbarDropdown from '@/components/NavbarDropdown.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { RouterLink } from 'vue-router';
import { mockRootState } from '../../mocks';
import router from '../../../src/router/index';

describe('NavbarDropdown logged in', () => {
  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      user: {
        name: 'Jane',
        id: '543653d45',
        provider: 'google',
      },
    }),
  });
  const wrapper = mount(NavbarDropdown, {
    global: {
      plugins: [store, router],
    },

  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('shows all expected links and divider', () => {
    const routerLinks = wrapper.findAllComponents(RouterLink);
    expect(routerLinks.length).toBe(3);
    expect(routerLinks[0].text()).toBe('Home');
    expect(routerLinks[1].text()).toBe('Project');
    expect(routerLinks[2].text()).toBe('About');
    expect(wrapper.find('a#logout-link').text()).toBe('Logout');
    expect(wrapper.findAll('.dropdown-divider').length).toBe(1);
  });

  test('shows logged in user text', () => {
    expect(wrapper.find('#logged-in-user').text()).toBe('Logged in as Jane');
  });
});

describe('NavbarDropdown logged out', () => {
  const store = new Vuex.Store<RootState>({
    state: mockRootState(),
  });
  const wrapper = mount(NavbarDropdown, {
    global: {
      plugins: [store, router],
    },

  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('shows all expected links', () => {
    const links = wrapper.findAll('a');
    expect(links.length).toBe(2);
    expect(links[0].text()).toBe('Home');
    expect(links[1].text()).toBe('About');
    expect(wrapper.findAll('.dropdown-divider').length).toBe(0);
  });

  test('shows no logged in user text', () => {
    expect(wrapper.find('#logged-in-user').text()).toBe('');
  });
});
