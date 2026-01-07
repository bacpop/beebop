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
export interface SpeciesConfig {
  hasSublineages: boolean;
  kmerInfo: SketchKmerArguments;
}

const baseApi = mande(getApiUrl(), { credentials: "include" });

export const useSpeciesStore = defineStore("species", {
  state: () => ({
    speciesConfig: {} as Record<string, SpeciesConfig>,
    species: [] as string[],
    toast: useToastService() as ReturnType<typeof useToastService>
  }),
  getters: {
    getSketchKmerArguments: (state) => (species: string) => state.speciesConfig[species]?.kmerInfo,
    getSpeciesConfig: (state) => (species: string) => state.speciesConfig[species],
    canAssignSublineages: (state) => (species: string) => state.speciesConfig[species]?.hasSublineages
  },
  actions: {
    async setSpeciesConfig() {
      try {
        const res = await baseApi.get<ApiResponse<Record<string, SpeciesConfig>>>("/speciesConfig");
        this.speciesConfig = res.data;
        this.species = Object.keys(res.data);
      } catch (error) {
        console.error(error);
        this.toast.showErrorToast("Failed to fetch sketch kmer arguments, please try again later");
      }
    }
  }
});
