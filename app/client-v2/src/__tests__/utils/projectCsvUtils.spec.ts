import type { AMR, ProjectSample } from "@/types/projectTypes";
import {
  downloadCsv,
  convertAmrForCsv,
  generateCsvContent,
  triggerCsvDownload,
  constructSublineageForCsv
} from "@/utils/projectCsvUtils";
import type { Mock } from "vitest";

const mockConvertProbabilityToWord = vitest.fn();
vitest.mock("@/utils/amrDisplayUtils", () => ({
  convertProbabilityToWord: () => mockConvertProbabilityToWord()
}));
document.createElement = vitest.fn().mockReturnValue({
  click: vitest.fn(),
  remove: vitest.fn()
});

describe("projectCsvUtils", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  describe("downloadCsv", () => {
    it("should generate and trigger CSV download with correct content and filename", () => {
      const samples = [
        {
          filename: "sample1",
          amr: { Penicillin: 0.9, Chloramphenicol: 0.8, Erythromycin: 0.7, Tetracycline: 0.6, Trim_sulfa: 0.5 },
          cluster: "cluster1"
        }
      ] as ProjectSample[];
      const filename = "test";

      downloadCsv(samples, filename);

      expect(document.createElement).toHaveBeenCalledWith("a");
      const anchor = (document.createElement as Mock).mock.results[0].value;
      expect(anchor.href).toContain("data:text/csv;charset=utf-8,");
      expect(anchor.download).toBe("test.csv");
      expect(anchor.click).toHaveBeenCalled();
      expect(anchor.remove).toHaveBeenCalled();
    });
  });

  describe("convertAmrForCsv", () => {
    it("should convert AMR object to CSV format", () => {
      const amr = {
        Penicillin: 0.9,
        Chloramphenicol: 0.8,
        Erythromycin: 0.7,
        Tetracycline: 0.6,
        Trim_sulfa: 0.5
      } as AMR;

      mockConvertProbabilityToWord.mockReturnValue("word");

      const result = convertAmrForCsv(amr);

      expect(result).toEqual({
        "Penicillin Resistance": "word",
        "Chloramphenicol Resistance": "word",
        "Erythromycin Resistance": "word",
        "Tetracycline Resistance": "word",
        "Cotrim Resistance": "word"
      });
    });
  });

  describe("generateCsvContent", () => {
    it("should generate CSV content from data array", () => {
      const data = [
        { filename: "sample1", Penicillin: "Penicillin-0.9", cluster: "cluster1" },
        { filename: "sample2", Penicillin: "Penicillin-0.8", cluster: "cluster2" }
      ];

      const result = generateCsvContent(data);

      expect(result).toBe(
        'filename,Penicillin,cluster\n"sample1","Penicillin-0.9","cluster1"\n"sample2","Penicillin-0.8","cluster2"'
      );
    });

    it("should return an empty string for empty data array", () => {
      const result = generateCsvContent([]);

      expect(result).toBe("");
    });
  });

  describe("triggerCsvDownload", () => {
    it("should create an anchor element and trigger download", () => {
      const csvContent = "filename,Penicillin,cluster\nsample1,Penicillin-0.9,cluster1";
      const filename = "test.csv";

      triggerCsvDownload(csvContent, filename);

      expect(document.createElement).toHaveBeenCalledWith("a");
      const anchor = (document.createElement as Mock).mock.results[0].value;

      expect(anchor.href).toBe("data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
      expect(anchor.download).toBe("test.csv");
      expect(anchor.click).toHaveBeenCalled();
      expect(anchor.remove).toHaveBeenCalled();
    });
  });

  describe("constructSublineageForCsv", () => {
    it("should construct sublineage CSV object from Sublineage", () => {
      const sublineage = {
        Rank_5_Lineage: 1,
        Rank_10_Lineage: 2,
        Rank_25_Lineage: 3,
        Rank_50_Lineage: 4
      };

      const result = constructSublineageForCsv(sublineage);

      expect(result).toEqual({
        "Rank 50 Sublineage": "4",
        "Rank 25 Sublineage": "3",
        "Rank 10 Sublineage": "2",
        "Rank 5 Sublineage": "1"
      });
    });
  });
});
