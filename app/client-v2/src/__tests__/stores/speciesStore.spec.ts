import { speciesConfigIndexUri } from "@/mocks/handlers/configHandlers";
import { MOCK_SPECIES_CONFIG } from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import { useSpeciesStore } from "@/stores/speciesStore";
import { http, HttpResponse } from "msw";
import { createPinia, setActivePinia } from "pinia";

const mockToastAdd = vitest.fn();
vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn(() => ({
    add: mockToastAdd
  }))
}));

describe("SpeciesStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("getters", () => {
    it("should return correct SketchArguments when getSketchKmerArguments is called", () => {
      const store = useSpeciesStore();
      store.speciesConfig = MOCK_SPECIES_CONFIG;

      const result = store.getSketchKmerArguments("Streptococcus pneumoniae");

      expect(result).toEqual(MOCK_SPECIES_CONFIG["Streptococcus pneumoniae"]);
    });

    it("should return undefined when getSketchKmerArguments is called with an invalid species", () => {
      const store = useSpeciesStore();
      store.speciesConfig = {
        "Streptococcus pneumoniae": {
          kmerMax: 14,
          kmerMin: 3,
          kmerStep: 3
        }
      } as any;

      const result = store.getSketchKmerArguments("Streptococcus agalactiae");

      expect(result).toBeUndefined();
    });

    it("should return correct SpeciesConfig when getSpeciesConfig is called", () => {
      const store = useSpeciesStore();
      store.speciesConfig = MOCK_SPECIES_CONFIG;

      const result = store.getSpeciesConfig("Streptococcus pneumoniae");

      expect(result).toEqual(MOCK_SPECIES_CONFIG["Streptococcus pneumoniae"]);
    });

    it("should return false when canAssignSublineages is called with a species that has no sublineages", () => {
      const store = useSpeciesStore();
      store.speciesConfig = MOCK_SPECIES_CONFIG;

      const result = store.canAssignSublineages("test species2");

      expect(result).toBe(false);
    });

    it("should return true when canAssignSublineages is called with a species that has sublineages", () => {
      const store = useSpeciesStore();
      store.speciesConfig = MOCK_SPECIES_CONFIG;

      const result = store.canAssignSublineages("test species1");

      expect(result).toBe(true);
    });
  });
  describe("actions", () => {
    it("should set speciesConfig from api when setSpeciesConfig is called", async () => {
      const store = useSpeciesStore();

      await store.setSpeciesConfig();

      expect(store.speciesConfig).toEqual(MOCK_SPECIES_CONFIG);
      expect(store.species).toEqual(Object.keys(MOCK_SPECIES_CONFIG));
    });

    it("should show error toast when setSpeciesConfig fails", async () => {
      server.use(http.get(speciesConfigIndexUri, () => HttpResponse.error()));
      const store = useSpeciesStore();

      await store.setSpeciesConfig();

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        detail: "Failed to fetch sketch kmer arguments, please try again later",
        life: 5000,
        summary: "Error"
      });
    });
  });
});
