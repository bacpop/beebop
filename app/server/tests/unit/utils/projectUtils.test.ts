import { UserStore } from "../../../src/db/userStore";
import { ProjectUtils } from "../../../src/utils/projectUtils";

describe("ProjectUtils", () => {
  describe("getResponseSamples", () => {
    const mockRedis = {} as any;

    const mockUserStore = new UserStore(mockRedis);
    const projectId = "testProjectId";
    const projectSamples = [
      { hash: "1234", filename: "test1.fa" },
      { hash: "1235", filename: "test2.fa" },
      { hash: "1236", filename: "test3.fa" },
    ];
    const apiData = {
      samples: [
        { hash: "1234", filename: "test1.fa", data: "data1" },
        { hash: "1235", filename: "test2.fa", data: "data2" },
        { hash: "1236", filename: "test3.fa", data: "data3" },
      ],
    } as any;
    const mockGetSample = jest.spyOn(mockUserStore, "getSample");

    beforeEach(() => {
      mockGetSample.mockClear();
      mockGetSample.mockImplementation(
        (projectId, sampleHash, fileName) =>
          ({
            amr: `AMR for ${projectId}-${sampleHash}-${fileName}`,
            sketch: `Sketch for ${projectId}-${sampleHash}-${fileName}`,
          } as any)
      );
    });

    it("should return samples with data from the store and the API", async () => {
      const result = await ProjectUtils.getResponseSamples(
        mockUserStore,
        projectId,
        projectSamples,
        apiData
      );
      expect(result).toEqual([
        {
          ...apiData.samples[0],
          amr: "AMR for testProjectId-1234-test1.fa",
          sketch: "Sketch for testProjectId-1234-test1.fa",
        },
        {
          ...apiData.samples[1],
          amr: "AMR for testProjectId-1235-test2.fa",
          sketch: "Sketch for testProjectId-1235-test2.fa",
        },
        {
          ...apiData.samples[2],
          amr: "AMR for testProjectId-1236-test3.fa",
          sketch: "Sketch for testProjectId-1236-test3.fa",
        },
      ]);
      expect(mockGetSample).toHaveBeenCalledTimes(3);
    });

    it("should return samples with data from the store if no API data is provided", async () => {
      const result = await ProjectUtils.getResponseSamples(
        mockUserStore,
        projectId,
        projectSamples
      );
      expect(result).toEqual([
        {
          hash: "1234",
          filename: "test1.fa",
          amr: "AMR for testProjectId-1234-test1.fa",
          sketch: "Sketch for testProjectId-1234-test1.fa",
        },
        {
          hash: "1235",
          filename: "test2.fa",
          amr: "AMR for testProjectId-1235-test2.fa",
          sketch: "Sketch for testProjectId-1235-test2.fa",
        },
        {
          hash: "1236",
          filename: "test3.fa",
          amr: "AMR for testProjectId-1236-test3.fa",
          sketch: "Sketch for testProjectId-1236-test3.fa",
        },
      ]);
      expect(mockGetSample).toHaveBeenCalledTimes(3);
    });
  });
});
