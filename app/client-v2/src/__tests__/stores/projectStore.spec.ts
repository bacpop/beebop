import { getApiUrl } from "@/config";
import { assignResultUri, projectIndexUri, statusUri } from "@/mocks/handlers/projectHandlers";
import {
  MOCK_PROJECT,
  MOCK_PROJECT_SAMPLES,
  MOCK_PROJECT_SAMPLES_BEFORE_RUN,
  MOCK_SPECIES,
  MOCK_SPECIES_CONFIG
} from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import { useProjectStore } from "@/stores/projectStore";
import { useSpeciesStore } from "@/stores/speciesStore";
import { AnalysisType, type HashedFile, type ProjectSample, type WorkerResponse } from "@/types/projectTypes";
import { flushPromises } from "@vue/test-utils";
import { HttpResponse, http } from "msw";
import { createPinia, setActivePinia } from "pinia";
import { Md5 } from "ts-md5";

const mockToastAdd = vitest.fn();
vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn(() => ({
    add: mockToastAdd
  }))
}));

describe("projectStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("getters", () => {
    describe("isReadyToRun", () => {
      it("should return true when all samples have sketch and amr", () => {
        const store = useProjectStore();
        store.project.samples = [{ sketch: {}, amr: { Chloramphenicol: 0.24 } }] as ProjectSample[];
        expect(store.isReadyToRun).toBe(true);
      });

      it("should return false when not all samples have sketch and amr", () => {
        const store = useProjectStore();
        store.project.samples = [{ sketch: {}, amr: undefined }] as ProjectSample[];
        expect(store.isReadyToRun).toBe(false);
      });
    });

    describe("isFinishedRun", () => {
      it("returns true when all status are complete", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          visualise: "finished",
          visualiseClusters: { cluster1: "finished" }
        } as any;
        expect(store.isFinishedRun).toBe(true);
      });

      it("returns false when not all fullStatuses are complete", () => {
        const store = useProjectStore();
        store.project.status = { assign: "started", network: "visualise" } as any;
        expect(store.isFinishedRun).toBe(false);
      });

      it("returns false when not all visualiseClusters are complete", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          visualise: "finished",
          visualiseClusters: { cluster1: "started" }
        } as any;
        expect(store.isFinishedRun).toBe(false);
      });

      it("returns false when there are no statuses", () => {
        const store = useProjectStore();
        store.project.status = undefined;
        expect(store.isFinishedRun).toBe(false);
      });
    });

    describe("numOfStatus", () => {
      it("returns the num of full statuses only", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          visualise: "started",
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "started"
          }
        } as any;

        expect(store.numOfFullStatus).toBe(2);
      });

      it("returns 0 when there are no statuses", () => {
        const store = useProjectStore();
        store.project.status = undefined;

        expect(store.numOfFullStatus).toBe(0);
      });
    });

    describe("hasStartedAtLeastOneRun", () => {
      it("should return true when project status is set", () => {
        const store = useProjectStore();
        store.project.status = { assign: "started", microreact: "finished", network: "finished" } as any;
        expect(store.hasStartedAtLeastOneRun).toBe(true);
      });
      it("should return false when project status is not set", () => {
        const store = useProjectStore();
        store.project.status = undefined;
        expect(store.hasStartedAtLeastOneRun).toBe(false);
      });
    });

    describe("analysisProgressPercentage", () => {
      it("returns 0 when there are no statuses", () => {
        const store = useProjectStore();
        store.project.status = undefined;
        expect(store.analysisProgressPercentage).toBe(0);
      });

      it("returns 100 when all statuses are complete", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          visualise: "finished",
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "finished"
          }
        } as any;
        expect(store.analysisProgressPercentage).toBe(100);
      });

      it("returns the correct percentage when some statuses are complete", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          visualise: "finished",
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "started"
          }
        } as any;
        expect(store.analysisProgressPercentage).toBe(Math.round(((1 + 1 / 2) / 2) * 100));
      });

      it("returns 0 when all statuses are incomplete", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "started",
          microreact: "started",
          network: "started",
          visualiseClusters: {
            cluster1: "started",
            cluster2: "started"
          }
        } as any;
        expect(store.analysisProgressPercentage).toBe(0);
      });

      it("returns the correct percentage when there are only fullStatuses", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          visualise: "started"
        } as any;
        expect(store.analysisProgressPercentage).toBe(Math.round((1 / 2) * 100));
      });
    });

    describe("firstAssignedCluster", () => {
      it("should return undefined when there is no assigned cluster", () => {
        const store = useProjectStore();
        store.project.samples = MOCK_PROJECT_SAMPLES_BEFORE_RUN;
        expect(store.firstAssignedCluster).toBeUndefined();
      });
    });

    describe("separatedStatuses", () => {
      it("returns empty objects when project status is undefined", () => {
        const store = useProjectStore();
        store.project.status = undefined;

        const result = store.separatedStatuses;

        expect(result).toEqual({ fullStatuses: {}, visualiseClusters: {} });
      });

      it("returns separated statuses correctly when project status has fullStatuses and visualiseClusters", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          network: "started",
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "started"
          }
        } as any;

        const result = store.separatedStatuses;

        expect(result).toEqual({
          fullStatuses: { assign: "finished", network: "started" },
          visualiseClusters: { cluster1: "finished", cluster2: "started" }
        });
      });

      it("returns separated statuses correctly when project status has only fullStatuses", () => {
        const store = useProjectStore();
        store.project.status = {
          assign: "finished",
          network: "started"
        } as any;

        const result = store.separatedStatuses;

        expect(result).toEqual({
          fullStatuses: { assign: "finished", network: "started" },
          visualiseClusters: {}
        });
      });

      it("returns separated statuses correctly when project status has only visualiseClusters", () => {
        const store = useProjectStore();
        store.project.status = {
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "started"
          }
        } as any;

        const result = store.separatedStatuses;

        expect(result).toEqual({
          fullStatuses: {},
          visualiseClusters: { cluster1: "finished", cluster2: "started" }
        });
      });
    });

    describe("statusValues", () => {
      let store: ReturnType<typeof useProjectStore>;

      beforeEach(() => {
        store = useProjectStore();
      });

      it("returns combined status values when both fullStatuses and visualiseClusters are present", () => {
        store.project.status = {
          assign: "finished",
          network: "started",
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "started"
          }
        } as any;

        const result = store.statusValues;

        expect(result).toEqual(["finished", "started", "finished", "started"]);
      });

      it("returns only fullStatuses when visualiseClusters are not present", () => {
        store.project.status = {
          assign: "finished",
          network: "started"
        } as any;

        const result = store.statusValues;

        expect(result).toEqual(["finished", "started"]);
      });

      it("returns only visualiseClusters when fullStatuses are not present", () => {
        store.project.status = {
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "started"
          }
        } as any;

        const result = store.statusValues;

        expect(result).toEqual(["finished", "started"]);
      });

      it("returns an empty array when there are no statuses", () => {
        store.project.status = undefined;

        const result = store.statusValues;

        expect(result).toEqual([]);
      });
    });

    describe("completeMicroreactNumerator", () => {
      it("returns 0 when there are no visualiseClusters", () => {
        const store = useProjectStore();
        store.project.status = undefined;

        expect(store.completeVisualiseNumerator).toBe(0);
      });

      it("returns 0 when no visualiseClusters are complete", () => {
        const store = useProjectStore();
        store.project.status = {
          visualiseClusters: {
            cluster1: "started",
            cluster2: "started"
          }
        } as any;

        expect(store.completeVisualiseNumerator).toBe(0);
      });

      it("returns the correct numerator when some visualiseClusters are complete", () => {
        const store = useProjectStore();
        store.project.status = {
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "started",
            cluster3: "finished"
          }
        } as any;

        expect(store.completeVisualiseNumerator).toBe(2 / 3);
      });

      it("returns 1 when all visualiseClusters are complete", () => {
        const store = useProjectStore();
        store.project.status = {
          visualiseClusters: {
            cluster1: "finished",
            cluster2: "finished"
          }
        } as any;

        expect(store.completeVisualiseNumerator).toBe(1);
      });
    });
  });

  describe("actions", () => {
    const mockFilesWithHashes = [
      { name: "sample1.fasta", text: () => Promise.resolve("sample1"), hash: Md5.hashStr("sample1") },
      { name: "sample2.fasta", text: () => Promise.resolve("sample2"), hash: Md5.hashStr("sample2") },
      { name: "sample3.fasta", text: () => Promise.resolve("sample3"), hash: Md5.hashStr("sample3") }
    ] as any[];

    class MockWorker implements Partial<Worker> {
      url: string;
      onmessage: (msg: any) => any;

      constructor(stringUrl: any) {
        this.url = stringUrl;
        this.onmessage = async () => {};
      }

      postMessage(msg: any) {
        this.onmessage({
          data: msg
        });
      }
    }

    (window as any).Worker = MockWorker;

    it("should reset & set correct status when getProject is called", async () => {
      const store = useProjectStore();
      store.project.hash = "hash-will-be-overwritten";

      await store.getProject("1");

      expect(store.project.hash).toBe(MOCK_PROJECT.hash);
      expect(store.project).toEqual({
        id: MOCK_PROJECT.id,
        hash: MOCK_PROJECT.hash,
        name: MOCK_PROJECT.name,
        timestamp: MOCK_PROJECT.timestamp,
        samples: MOCK_PROJECT.samples,
        status: MOCK_PROJECT.status,
        species: MOCK_PROJECT.species
      });
      expect(store.hasStartedAtLeastOneRun).toBe(true);
    });

    it("should not upload duplicates when onFilesUpload is called", async () => {
      const newFileWithHash = {
        name: "sampleNew.fasta",
        text: () => Promise.resolve("sampleNew"),
        hash: Md5.hashStr("New")
      };
      const store = useProjectStore();
      const processFilesSpy = vitest.spyOn(store, "processFiles");
      store.project.samples = mockFilesWithHashes.map((file) => ({ hash: file.hash, filename: file.name }));

      store.onFilesUpload([mockFilesWithHashes[0], newFileWithHash]);

      expect(processFilesSpy).toHaveBeenCalledWith([newFileWithHash]);
    });
    it("should show error toast and not call processFiles when onFilesUpload is called with 0 new files", async () => {
      const store = useProjectStore();
      store.toast.showErrorToast = vitest.fn();
      store.project.samples = mockFilesWithHashes.map((file) => ({ hash: file.hash, filename: file.name }));
      const processFilesSpy = vitest.spyOn(store, "processFiles");
      store.onFilesUpload(mockFilesWithHashes[0]);

      expect(store.toast.showErrorToast).toHaveBeenCalledWith("No new files to upload.");
      expect(processFilesSpy).not.toHaveBeenCalled();
    });
    it("should call batchFilesForProcessing and processFileBatches when processFiles is called", async () => {
      const mockHashedFileBatches = [[{ hash: "test-hash" }], [{ hash: "test-hash" }]] as HashedFile[][];
      const store = useProjectStore();
      store.project.samples = [];

      const batchFilesForProcessingSpy = vitest
        .spyOn(store, "batchFilesForProcessing")
        .mockResolvedValueOnce(mockHashedFileBatches);
      const processFileBatchesSpy = vitest.spyOn(store, "processFileBatches");

      await store.processFiles(mockFilesWithHashes);

      expect(batchFilesForProcessingSpy).toHaveBeenCalledWith(mockFilesWithHashes);
      expect(processFileBatchesSpy).toHaveBeenCalledWith(mockHashedFileBatches);
    });
    it("should save and post samples to server when handleWorkerResponse is called", async () => {
      const testSamples = [
        { hash: "sample1", filename: "sample1.fasta", amr: { Penicillin: 0.24, Chloramphenicol: 0.24 }, sketch: {} },
        { hash: "sample2", filename: "sample2.fasta", amr: { Penicillin: 0.24, Chloramphenicol: 0.24 }, sketch: {} }
      ] as WorkerResponse[];
      const store = useProjectStore();
      store.project.samples = [];
      store.project.id = "1";
      server.use(
        http.post(`${projectIndexUri}/${store.project.id}/sample`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(testSamples);
          return HttpResponse.text("");
        })
      );

      await store.handleWorkerResponse(testSamples);

      expect(store.project.samples).toEqual(testSamples);
    });

    it("should remove samples from fileSamples when handleWorkerResponse fails & call toast.showErrorToast", async () => {
      const testSamples = [
        { hash: "sample1", filename: "sample1.fasta", amr: { Penicillin: 0.24, Chloramphenicol: 0.24 }, sketch: {} }
      ] as WorkerResponse[];
      const store = useProjectStore();
      store.project.id = "1";
      store.toast.showErrorToast = vitest.fn();
      store.project.samples = [];
      server.use(http.post(`${projectIndexUri}/${store.project.id}/sample`, () => HttpResponse.error()));

      await store.handleWorkerResponse(testSamples);

      expect(store.project.samples).toEqual([]);
      expect(store.toast.showErrorToast).toHaveBeenCalledWith(
        "Ensure uploaded sample files is correct or try again later."
      );
    });

    it("should set pollingIntervalId when pollAnalysisStatus is called & not already set", async () => {
      const store = useProjectStore();
      store.pollingIntervalId = null;

      store.pollAnalysisStatus();

      await flushPromises();

      expect(store.pollingIntervalId).not.toBeNull();
    });
    it("should not set pollingIntervalId when pollAnalysisStatus is called & already set", async () => {
      const store = useProjectStore();
      const interval = setInterval(() => {}, 1000);
      store.pollingIntervalId = interval;

      store.pollAnalysisStatus();

      await flushPromises();

      expect(store.pollingIntervalId).toEqual(interval);
    });
    it("should clear pollingIntervalId when stopPollingStatus is called and is set", async () => {
      const store = useProjectStore();
      const interval = setInterval(() => {}, 1000);
      store.pollingIntervalId = interval;

      store.stopPollingStatus();

      await flushPromises();

      expect(store.pollingIntervalId).toBeNull();
    });
    it("should set cluster values correctly when getClusterAssignResult is called", async () => {
      const store = useProjectStore();
      store.project.samples = structuredClone(MOCK_PROJECT_SAMPLES_BEFORE_RUN);

      await store.getClusterAssignResult();

      store.project.samples.forEach((sample, index) => {
        expect(sample.cluster).toBe(MOCK_PROJECT_SAMPLES[index].cluster);
      });
    });
    it("should not set cluster values when getClusterAssignResult fails", async () => {
      const store = useProjectStore();
      store.project.samples = structuredClone(MOCK_PROJECT_SAMPLES_BEFORE_RUN);

      server.use(http.post(assignResultUri, () => HttpResponse.error()));

      await store.getClusterAssignResult();

      store.project.samples.forEach((sample) => {
        expect(sample.cluster).toBeUndefined();
      });
    });
    it("should set failReasons if present when getClusterAssignResult is called", async () => {
      server.use(
        http.post(assignResultUri, () =>
          HttpResponse.json({
            data: {
              sample1: {
                hash: "sample1",
                failReasons: ["length too short", "failed distance qc"]
              }
            },
            errors: [],
            status: "success"
          })
        )
      );
      const store = useProjectStore();
      store.project.samples = [{ hash: "sample1", filename: "sample1.fasta" }];

      await store.getClusterAssignResult();

      expect(store.project.samples[0].failReasons).toStrictEqual(["length too short", "failed distance qc"]);
    });
    it("should stop polling if status request returns complete status & sets stores analysisStatus", async () => {
      const store = useProjectStore();
      store.stopPollingStatus = vitest.fn();

      await store.getAnalysisStatus();

      expect(store.project.status).toEqual(MOCK_PROJECT.status);
      expect(store.stopPollingStatus).toHaveBeenCalled();
    });
    it("should stop polling & call showErrorToast if status request fails", async () => {
      const store = useProjectStore();
      store.stopPollingStatus = vitest.fn();
      store.toast.showErrorToast = vitest.fn();
      server.use(http.post(statusUri, () => HttpResponse.error()));

      await store.getAnalysisStatus();

      expect(store.pollingIntervalId).toBeNull();
      expect(store.stopPollingStatus).toHaveBeenCalled();
      expect(store.toast.showErrorToast).toHaveBeenCalledWith(
        "Error fetching analysis status. Try refreshing the page, or create a new project."
      );
    });

    it("should not stop polling if status request returns incomplete status", async () => {
      const store = useProjectStore();
      store.stopPollingStatus = vitest.fn();
      server.use(
        http.post(statusUri, () =>
          HttpResponse.json({
            data: { assign: "finished", network: "started", microreact: "finished", visualiseClusters: {} },
            errors: [],
            status: "success"
          })
        )
      );

      await store.getAnalysisStatus();

      expect(store.stopPollingStatus).not.toHaveBeenCalled();
    });

    it("should not stop polling if visualiseClusters status not finished", async () => {
      const store = useProjectStore();
      store.stopPollingStatus = vitest.fn();
      server.use(
        http.post(statusUri, () =>
          HttpResponse.json({
            data: {
              assign: "finished",
              network: "finished",
              microreact: "finished",
              visualiseClusters: { cluster1: "started" }
            },
            errors: [],
            status: "success"
          })
        )
      );

      await store.getAnalysisStatus();

      expect(store.stopPollingStatus).not.toHaveBeenCalled();
    });

    it("should call getClusterAssignResult when assign status changes to finished", async () => {
      const store = useProjectStore();
      store.getClusterAssignResult = vitest.fn();
      store.project.status = { assign: "started", microreact: "finished", network: "finished" } as any;

      await store.getAnalysisStatus();

      expect(store.getClusterAssignResult).toHaveBeenCalled();
    });

    it("should stop polling & set all status to failed if assign status is failed", async () => {
      const store = useProjectStore();
      store.stopPollingStatus = vitest.fn();
      server.use(
        http.post(statusUri, () => HttpResponse.json({ data: { assign: "failed" }, errors: [], status: "success" }))
      );

      await store.getAnalysisStatus();

      expect(store.project.status).toEqual({
        assign: "failed",
        visualise: "failed",
        visualiseClusters: {}
      });
      expect(store.stopPollingStatus).toHaveBeenCalled();
    });
    it("should set state, call buildRunAnalysisPostBody, pollAnalysisStatus and update sample hasRun when runAnalysis is called", async () => {
      const store = useProjectStore();
      const samples = structuredClone(MOCK_PROJECT_SAMPLES_BEFORE_RUN);
      store.project.samples = samples;
      store.buildRunAnalysisPostBody = vitest.fn().mockReturnValue({ projectHash: "test-hash" });
      store.pollAnalysisStatus = vitest.fn();

      await store.runAnalysis();

      expect(store.buildRunAnalysisPostBody).toHaveBeenCalled();
      expect(store.pollAnalysisStatus).toHaveBeenCalled();
      expect(store.hasStartedAtLeastOneRun).toBe(true);
      expect(store.project.hash).toBe("test-hash");
      expect(store.project.status).toEqual({
        assign: "submitted",
        visualise: "submitted",
        visualiseClusters: {}
      });
      samples.forEach((sample) => {
        expect(sample.hasRun).toBe(true);
      });
    });
    it("should not call pollAnalysisStatus ,update hash & set status to null, and samples to not run when poppunk apu fails", async () => {
      const mockSamples = structuredClone(MOCK_PROJECT_SAMPLES_BEFORE_RUN);
      const store = useProjectStore();
      store.project.samples = mockSamples;
      store.buildRunAnalysisPostBody = vitest.fn().mockReturnValue({ projectHash: "test-hash" });
      store.pollAnalysisStatus = vitest.fn();
      server.use(http.post("*", () => HttpResponse.error()));

      await store.runAnalysis();

      mockSamples.forEach((sample) => {
        expect(sample.hasRun).toBe(false);
      });
      expect(store.pollAnalysisStatus).not.toHaveBeenCalled();
      expect(store.project.status).toBeUndefined();
      expect(store.hasStartedAtLeastOneRun).toBe(false);
      expect(store.project.hash).toBeUndefined();
    });
    it("should correctly create post body when buildRunAnalysisPostBody is called", () => {
      const store = useProjectStore();
      const projectHash = "2b4829de7ce1dc69265f3468bd247005";
      store.project.id = "1";
      store.project.samples = MOCK_PROJECT_SAMPLES;

      const postBody = store.buildRunAnalysisPostBody();

      expect(postBody).toEqual({
        projectHash: projectHash,
        projectId: "1",
        names: {
          [MOCK_PROJECT_SAMPLES[0].hash]: MOCK_PROJECT_SAMPLES[0].filename,
          [MOCK_PROJECT_SAMPLES[1].hash]: MOCK_PROJECT_SAMPLES[1].filename,
          [MOCK_PROJECT_SAMPLES[2].hash]: MOCK_PROJECT_SAMPLES[2].filename
        },
        sketches: {
          [MOCK_PROJECT_SAMPLES[0].hash]: MOCK_PROJECT_SAMPLES[0].sketch,
          [MOCK_PROJECT_SAMPLES[1].hash]: MOCK_PROJECT_SAMPLES[1].sketch,
          [MOCK_PROJECT_SAMPLES[2].hash]: MOCK_PROJECT_SAMPLES[2].sketch
        },
        amrForMetadataCsv: [
          {
            "Chloramphenicol Resistance": "Probably",
            "Cotrim Resistance": "Probably not",
            "Erythromycin Resistance": "Probably not",
            ID: "sample1-test-hash",
            "Penicillin Resistance": "Unlikely",
            "Tetracycline Resistance": "Highly unlikely"
          },
          {
            "Chloramphenicol Resistance": "Probably",
            "Cotrim Resistance": "Almost certainly",
            "Erythromycin Resistance": "Almost certainly",
            ID: "sample2-test-hash",
            "Penicillin Resistance": "Highly unlikely",
            "Tetracycline Resistance": "Highly unlikely"
          },
          {
            "Chloramphenicol Resistance": "Probably",
            "Cotrim Resistance": "Unlikely",
            "Erythromycin Resistance": "Probably not",
            ID: "sample3-test-hash",
            "Penicillin Resistance": "Probably",
            "Tetracycline Resistance": "Highly unlikely"
          }
        ]
      });
    });
    it("should get download url & download when downloadZip is called", async () => {
      const store = useProjectStore();
      store.project.hash = "test-hash";
      const fakeObjectUrl = "fake-object-url";
      const mockFileLink = {
        href: "",
        download: vitest.fn(),
        click: vitest.fn()
      } as any;
      document.createElement = () => mockFileLink;
      URL.createObjectURL = vitest.fn(() => fakeObjectUrl);
      URL.revokeObjectURL = vitest.fn();
      const mockBufferRes = new ArrayBuffer(10);

      server.use(
        http.post(`${getApiUrl()}/downloadZip`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ type: AnalysisType.MICROREACT, cluster: "GPSC1", projectHash: store.project.hash });

          return HttpResponse.arrayBuffer(mockBufferRes, {
            status: 201,
            headers: { "Content-Type": "application/zip" }
          });
        })
      );

      await store.downloadZip(AnalysisType.MICROREACT, "GPSC1");

      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ size: 10, type: "application/zip" }));
      expect(mockFileLink.href).toBe(fakeObjectUrl);
      expect(mockFileLink.download).toBe(`${AnalysisType.MICROREACT}_clusterGPSC1.zip`);
      expect(mockFileLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(fakeObjectUrl);
    });
    it("should not download if downloadZip fetch errors", async () => {
      const store = useProjectStore();
      URL.createObjectURL = vitest.fn();

      server.use(http.post(`${getApiUrl()}/downloadZip`, () => HttpResponse.error()));

      await store.downloadZip(AnalysisType.MICROREACT, "GPSC1");

      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it("should call toast with msg passed in when toast.showErrorToast called", () => {
      const store = useProjectStore();

      store.toast.showErrorToast("test-error");

      expect(mockToastAdd).toHaveBeenCalledWith({
        severity: "error",
        summary: "Error",
        detail: "test-error",
        life: 5000
      });
    });

    it("should call api and remove sample from store at index when removeUploadedFile is called", async () => {
      const store = useProjectStore();
      store.project.samples = ["sample1", "sample2", "sample3"] as any;

      await store.removeUploadedFile(2);

      expect(store.project.samples).toEqual(["sample1", "sample2"]);
    });
    it("should call api with correct params and toast.showErrorToast when removeUploadedFile fails", async () => {
      const store = useProjectStore();
      store.toast.showErrorToast = vitest.fn();
      store.project.samples = ["sample1", "sample2", "sample3"] as any;
      server.use(
        http.patch(
          `/project/${store.project.id}/sample/${store.project.samples[2].hash}/delete`,
          async ({ request }) => {
            const body = await request.json();

            expect(body).toEqual({ filename: store.project.samples[2].filename });

            return HttpResponse.error();
          }
        )
      );

      await store.removeUploadedFile(2);

      expect(store.toast.showErrorToast).toHaveBeenCalledWith("Error removing file. Try again later.");
      expect(store.project.samples).toEqual(["sample1", "sample2", "sample3"]);
    });
    it("should set all status to failed & return true if assign is failed when processStatusAndGetPolling called", async () => {
      const analysisStatus = { assign: "failed", visualise: "deferred" } as any;
      const store = useProjectStore();

      const stopPolling = await store.processStatusAndGetStopPolling(analysisStatus, "waiting");

      expect(stopPolling).toBe(true);
      expect(store.project.status).toStrictEqual({
        assign: "failed",
        visualise: "failed",
        visualiseClusters: {}
      });
    });
    it("should call getClusterAssignResult if assign is failed when processStatusAndGetPolling called", async () => {
      const analysisStatus = { assign: "failed", visualise: "waiting" } as any;
      const store = useProjectStore();
      store.getClusterAssignResult = vitest.fn();

      await store.processStatusAndGetStopPolling(analysisStatus, "waiting");

      expect(store.getClusterAssignResult).toHaveBeenCalled();
    });
    it("should return 10 when navigator.hardwareConcurrency is 20 when getOptimalWorkerCount is called", () => {
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 20, writable: true });
      const store = useProjectStore();

      expect(store.getOptimalWorkerCount()).toBe(10);
    });
    it("returns 4 when navigator.hardwareConcurrency is not available", () => {
      Object.defineProperty(navigator, "hardwareConcurrency", {
        value: undefined,
        writable: true
      });
      const store = useProjectStore();
      expect(store.getOptimalWorkerCount()).toBe(4);
    });
    it("should batch files correctly when batchFilesForProcessing is called", async () => {
      const mockFilesWithHashes = Array.from({ length: 98 }, (_, index) => ({
        name: `sample${index + 1}.fasta`,
        text: () => Promise.resolve(`sample${index + 1}`)
      })) as unknown as File[];
      const store = useProjectStore();

      const fileBatches = await store.batchFilesForProcessing(mockFilesWithHashes);

      expect(fileBatches.length).toBe(Math.ceil(mockFilesWithHashes.length / 5));
    });

    it("should process file batches correctly with species kmer args when processFileBatches is called", async () => {
      const mockFilesWithHashes = Array.from({ length: 98 }, (_, index) => ({
        name: `sample${index + 1}.fasta`,
        text: () => Promise.resolve(`sample${index + 1}`)
      })) as unknown as File[];
      const speciesStore = useSpeciesStore();
      speciesStore.sketchKmerArguments = MOCK_SPECIES_CONFIG;

      const projectStore = useProjectStore();
      projectStore.project.species = MOCK_SPECIES[0];

      projectStore.getOptimalWorkerCount = vitest.fn().mockReturnValue(8);
      const batchPromise = vitest.spyOn(projectStore, "computeAmrAndSketch").mockResolvedValue();
      const hashedFileBatches = await projectStore.batchFilesForProcessing(mockFilesWithHashes);

      await projectStore.processFileBatches(hashedFileBatches);
      await flushPromises();

      expect(projectStore.uploadingPercentage).toEqual(100);
      hashedFileBatches.forEach((batch) => {
        expect(batchPromise).toHaveBeenCalledWith(batch, MOCK_SPECIES_CONFIG[MOCK_SPECIES[0]]);
      });
    });
  });
});
