
import DropZone from '@/components/DropZone.vue';
import { mount } from '@vue/test-utils'
import { RootState } from '@/store/state';
import { mockRootState } from '../mocks';
import Vuex from 'vuex';


describe('Dropzone', () => {
      const processFiles = jest.fn()

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
            expect(wrapper.exists()).toBe(true)
      });

      it('processes dropped files', () => {
            // call onDrop function
            // ???
            // should have called processFiles()
            // expect(processFiles).toHaveBeenCalledTimes(1);
            
      });
});