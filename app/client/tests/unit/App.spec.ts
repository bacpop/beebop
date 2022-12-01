import App from '@/App.vue';
import { shallowMount } from "@vue/test-utils";
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../mocks';
import NavbarDropdown from '@/components/NavbarDropdown.vue';

describe('App', () => {
    const getUser = jest.fn();

    const store = new Vuex.Store<RootState>({
        state: mockRootState({
          user: {
            name: 'Jane',
            id: '543653d45',
            provider: 'google',
          },
        }),
        actions: {
            getUser,
        },
    });
    const wrapper = shallowMount(App, {
        global: {
            plugins: [store],
        },
    });
    
    test('does a wrapper exist', () => {
        expect(wrapper.exists()).toBe(true);
    });

    test('gets user information on mount', () => {
        expect(getUser).toHaveBeenCalledTimes(1);
    });

    test('displays logo and has Navbar dropdown menu', () => {
        expect(wrapper.findAll('.logo').length).toBe(1);
        expect(wrapper.findAllComponents(NavbarDropdown).length).toBe(1);
    });
    
});