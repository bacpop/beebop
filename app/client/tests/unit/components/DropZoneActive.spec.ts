const mockGetRootProps = jest.fn().mockReturnValue({ rprop: 'rval' });
const mockGetInputProps = jest.fn().mockReturnValue({ iprop: 'ival' });
const mockUseDropzoneActive = jest.fn().mockReturnValue({
  getRootProps: mockGetRootProps,
  getInputProps: mockGetInputProps,
  isDragActive: true,
});
jest.mock('vue3-dropzone', () => ({
  useDropzone: mockUseDropzoneActive,
}));

/* eslint-disable import/first */
import DropZone from '@/components/DropZone.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../../mocks';

describe('Dropzone', () => {
  const store = new Vuex.Store<RootState>({
    state: mockRootState({
      user: {
        name: 'Jane',
        id: '543653d45',
        provider: 'google',
      },
      results: {
        perIsolate: {},
        perCluster: {},
      },
    }),
  });
  const wrapper = mount(DropZone, {
    global: {
      plugins: [store],
    },
  });

  it('displays text for isDragActive', () => {
    expect(wrapper.find('.dropzone').text()).toBe('Drop the files here ...');
  });
});
