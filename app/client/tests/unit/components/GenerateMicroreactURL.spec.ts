import GenerateMicroreactURL from '@/components/GenerateMicroreactURL.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('Generate Microreact URL button with no token submitted', () => {
  const buildMicroreactURL = jest.fn();

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {},
      },
      microreactToken: null,
      errors: [],
    }),
    actions: {
      buildMicroreactURL,
    },
  });
  const wrapper = mount(GenerateMicroreactURL, {
    global: {
      plugins: [store],
    },
  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('on click sets modal visibility to true', () => {
    expect(wrapper.findAll('button')).toHaveLength(1);
    expect(wrapper.findAll('Modal')).toHaveLength(0);
    const button = wrapper.findAll('button')[0];
    expect(wrapper.vm.isModalVisible).toBe(false);
    button.trigger('click');
    expect(wrapper.vm.isModalVisible).toBe(true);
  });
});

describe('Modal is visible on isModalVisible: true', () => {
  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {},
      },
      microreactToken: 'microreact_token',
      errors: [],
    }),
  });
  const wrapper = mount(GenerateMicroreactURL, {
    data() {
      return {
        isModalVisible: true,
      };
    },
    global: {
      plugins: [store],
    },
  });
  test('Modal appears on isModalVisible: true', () => {
    expect(wrapper.findAll('.modalFlex')).toHaveLength(1);
    expect(wrapper.findAll('.modalFlex')[0].text()).toContain('No token submitted yet');
  });
});

describe('Modal shows different text when creating URL already returned wrong token error', () => {
  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {},
      },
      microreactToken: 'microreact_token',
      errors: [
        { error: 'Wrong Token' },
      ],
    }),
  });
  const wrapper = mount(GenerateMicroreactURL, {
    data() {
      return {
        isModalVisible: true,
      };
    },
    global: {
      plugins: [store],
    },
  });
  test('Modal appears on isModalVisible: true', () => {
    expect(wrapper.findAll('.modalFlex')).toHaveLength(1);
    expect(wrapper.findAll('.modalFlex')[0].text()).toContain('Your submitted token is invalid');
  });
});

describe('Submitting token closes modal and saves token', () => {
  const buildMicroreactURL = jest.fn();

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {},
      },
      microreactToken: 'microreact_token',
      errors: [],
    }),
    actions: {
      buildMicroreactURL,
    },
  });
  const wrapper = mount(GenerateMicroreactURL, {
    data() {
      return {
        isModalVisible: true,
        token: 'microreact_token',
      };
    },
    global: {
      plugins: [store],
    },
  } as any);
  test('Modal appears on isModalVisible: true', () => {
    expect(wrapper.findAll('.modalFlex .btn-standard')).toHaveLength(1);
    const submitButton = wrapper.findAll('.modalFlex .btn-standard')[0];
    submitButton.trigger('click');
    expect(wrapper.vm.isModalVisible).toBe(false);
    expect(buildMicroreactURL).toHaveBeenCalledTimes(1);
  });
});

describe('Generates URL when token is available', () => {
  const buildMicroreactURL = jest.fn();

  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {},
      },
      microreactToken: 'microreact_token',
      errors: [],
    }),
    actions: {
      buildMicroreactURL,
    },
  });
  const wrapper = mount(GenerateMicroreactURL, {
    global: {
      plugins: [store],
    },
  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('on click triggers action to get URL', () => {
    expect(wrapper.findAll('button')).toHaveLength(1);
    const button = wrapper.findAll('button')[0];
    button.trigger('click');
    expect(buildMicroreactURL).toHaveBeenCalledTimes(1);
  });
});

describe('Provides link to be redirected to microreact', () => {
  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      results: {
        perIsolate: {},
        perCluster: {
          7: {
            cluster: '7',
            microreactURL: 'microreact.org/mock',
          },
        },
      },
      microreactToken: 'microreact_token',
      errors: [],
    }),
  });
  const wrapper = mount(GenerateMicroreactURL, {
    propsData: {
      cluster: 7,
    },
    global: {
      plugins: [store],
    },
  } as any);

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('get href from state', () => {
    expect(wrapper.findAll('button')).toHaveLength(0);
    expect(wrapper.findAll('a')).toHaveLength(1);
    const link = wrapper.find('a');
    expect(link.attributes().href).toBe('microreact.org/mock');
  });
});
