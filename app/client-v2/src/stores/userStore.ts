import { getApiUrl } from '@/config';
import { defineStore } from 'pinia';

export interface UserResponse {
  data: {
    id: string;
    name: string;
    provider: string;
  } | null;
  errors: string[];
  status: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    id: undefined as undefined | string,
    name: undefined as undefined | string,
    provider: undefined as undefined | string
  }),
  getters: {
    isAuthenticated(state) {
      return !!state.id;
    }
  },
  actions: {
    // todo: proper error handling
    async getUser() {
      try {
        const res = await fetch(`${getApiUrl()}/user`, {
          credentials: 'include'
        });
        const data: UserResponse = await res.json();
        this.id = data.data?.id;
        this.name = data.data?.name;
        this.provider = data.data?.provider;
      } catch (e) {
        console.error(e);
        this.id = undefined;
        this.name = undefined;
        this.provider = undefined;
      }
    }
  }
});
