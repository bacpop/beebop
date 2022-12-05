import NavbarDropdown from '@/components/NavbarDropdown.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

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
            plugins: [store],
        },

    });

    test('does a wrapper exist', () => {
        expect(wrapper.exists()).toBe(true);
    });

    test('shows all expected links and divider', () => {
        const links = wrapper.findAll('a');
        expect(links.length).toBe(4);
        expect(links[0].text()).toBe('Home');
        expect(links[1].text()).toBe('Project');
        expect(links[2].text()).toBe('About');
        expect(links[3].text()).toBe('Logout');
        expect(wrapper.findAll('.dropdown-divider').length).toBe(1);
    })

});

describe('NavbarDropdown logged out', () => {
    const store = new Vuex.Store<RootState>({
        state: mockRootState(),
    });
    const wrapper = mount(NavbarDropdown, {
        global: {
            plugins: [store],
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
    })

});