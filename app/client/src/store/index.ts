import { createStore } from 'vuex';
import actions from '@/store/actions';
import mutations from '@/store/mutations';

export default createStore({
  state: {
    versions: [],
  },
  getters: {
  },
  mutations,
  actions,
  modules: {
  },
});
