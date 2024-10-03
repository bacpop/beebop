import { useToastService } from "@/composables/useToastService";
import { getApiUrl } from "@/config";
import { type ApiResponse } from "@/types/projectTypes";
import { mande } from "mande";
import { defineStore } from "pinia";

export interface SketchKmerArguments {
  kmerMin: number;
  kmerMax: number;
  kmerStep: number;
}

const baseApi = mande(getApiUrl(), { credentials: "include" });

export const useSpeciesStore = defineStore("species", {
  state: () => ({
    sketchKmerArguments: {} as Record<string, SketchKmerArguments>,
    species: [] as string[],
    toast: useToastService() as ReturnType<typeof useToastService>
  }),
  getters: {
    getSketchKmerArguments: (state) => (species: string) => state.sketchKmerArguments[species]
  },
  actions: {
    async setSpeciesConfig() {
      try {
        const res = await baseApi.get<ApiResponse<Record<string, SketchKmerArguments>>>("/speciesConfig");
        this.sketchKmerArguments = res.data;
        this.species = Object.keys(res.data);
      } catch (error) {
        console.error(error);
        this.toast.showErrorToast("Failed to fetch sketch kmer arguments, please try again later");
      }
    }
  }
});
