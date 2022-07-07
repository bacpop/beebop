const mockGetRootProps = jest.fn().mockReturnValue({ rprop: 'rval' });
const mockGetInputProps = jest.fn().mockReturnValue({ iprop: 'ival' });
const mockUseDropzone = jest.fn().mockReturnValue({
  getRootProps: mockGetRootProps,
  getInputProps: mockGetInputProps,
  isDragActive: false,
});
jest.mock('vue3-dropzone', () => ({
  useDropzone: mockUseDropzone,
}));

/* eslint-disable import/first */
import DropZone from '@/components/DropZone.vue';
import { mount } from '@vue/test-utils';
import { RootState } from '@/store/state';
import Vuex from 'vuex';
import { mockRootState } from '../mocks';

describe('Dropzone', () => {
  const processFiles = jest.fn();

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
      processFiles,
    },
  });
  const wrapper = mount(DropZone, {
    global: {
      plugins: [store],
    },
  });

  test('does a wrapper exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('processes dropped files', () => {
    const file = {
      name: 'sample.fa',
    };

    expect(mockUseDropzone).toHaveBeenCalledTimes(1);
    expect(mockUseDropzone.mock.calls[0][0].accept).toStrictEqual(['.fa', '.fasta']);
    wrapper.vm.onDrop([file]);
    expect(processFiles).toHaveBeenCalledTimes(1);
    expect(processFiles.mock.calls[0][1]).toStrictEqual([file]);
  });

  it('sets dropzone props', () => {
    expect(wrapper.find('.dropzone').attributes('rprop')).toBe('rval');
    expect(wrapper.find('input').attributes('iprop')).toBe('ival');
  });

  it('displays text for !isDragActive', () => {
    expect(wrapper.find('.dropzone').text()).toBe("Drag and drop your fasta files here, or click to select files");
  });

});
