import SelectAction from '@/components/SelectAction.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('StartButton', () => {
  const getUser = jest.fn();
  const mockRouter = {
    push: jest.fn(),
  };

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
  const wrapper = mount(SelectAction, {
    global: {
      plugins: [store],
      mocks: {
        $router: mockRouter,
      },
    },

  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('gets user information on mount', () => {
    expect(getUser).toHaveBeenCalledTimes(1);
  });

  test('displays greeting', () => {
    const greeting = wrapper.find('p');
    expect(greeting.text()).toBe('Welcome back, Jane!');
  });

  test('has 2 buttons', () => {
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toBe('Run new analysis');
    expect(buttons[1].text()).toBe('See previous analyses');
  });

  test('clicking first button leads to project view', () => {
    const button1 = wrapper.findAll('button')[0];
    button1.trigger('click');
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/project');
  });
});
