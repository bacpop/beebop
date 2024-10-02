import { getApiUrl } from "@/config";
import { SPECIES, type ApiResponse, type SketchKmerArguments, type Species } from "@/types/projectTypes";
import { mande } from "mande";
import { defineStore } from "pinia";

const baseApi = mande(getApiUrl(), { credentials: "include" });

export const useArgumentsStore = defineStore("arguments", {
  state: () => ({
    sketchKmerArguments: {} as Record<string, SketchKmerArguments>
  }),
  getters: {
    getSketchKmerArguments: (state) => (species: Species) => state.sketchKmerArguments[species]
  },
  actions: {
    async setSketchKmerArguments() {
      try {
        const res = await baseApi.post<ApiResponse<Record<Species, SketchKmerArguments>>>("/sketchKmerArguments", {
          species: SPECIES
        });
        this.sketchKmerArguments = res.data;
      } catch (error) {
        console.error(error);
      }
    }
  }
});
