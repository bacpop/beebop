import { mount } from '@vue/test-utils';
import AboutView from '@/views/AboutView.vue';
import { createStore } from 'vuex';

describe('About', () => {
  const getVersions = jest.fn();

  const store = createStore({
    state() {
      return {
        versions: {
          status: 'success',
          errors: [],
          data: [
            { name: 'beebop', version: '0.1.0' },
            { name: 'poppunk', version: '2.4.0' },
          ],
        },
      };
    },
    actions: {
      getVersions,
    },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders VersionInfo', () => {
    const wrapper = mount(AboutView, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.find('h2').text()).toMatch('About');
    const versions = wrapper.findAll('.version-info');
    expect(versions.length).toBe(2);
    expect(versions[0].text()).toBe('beebop 0.1.0');
    expect(versions[1].text()).toBe('poppunk 2.4.0');
  });

  it('calls getVersion', () => {
    const wrapper = mount(AboutView, { // eslint-disable-line @typescript-eslint/no-unused-vars
      global: {
        plugins: [store],
      },
    });
    expect(getVersions).toHaveBeenCalled();
  });
});
