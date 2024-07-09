import { getApiUrl } from "@/config";
import { assignResultUri, projectIndexUri, statusUri } from "@/mocks/handlers/projectHandlers";
import { MOCK_PROJECT, MOCK_PROJECT_SAMPLES, MOCK_PROJECT_SAMPLES_BEFORE_RUN } from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import { useProjectStore } from "@/stores/projectStore";
import { WorkerResponseValueTypes, type ProjectSample, AnalysisType, type AnalysisStatus } from "@/types/projectTypes";
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
    it("isReadyToRun returns true when all samples have sketch and amr", () => {
      const store = useProjectStore();
      store.project.samples = [{ sketch: {}, amr: { Chloramphenicol: 0.24 } }] as ProjectSample[];
      expect(store.isReadyToRun).toBe(true);
    });

    it("isReadyToRun returns false when not all samples have sketch and amr", () => {
      const store = useProjectStore();
      store.project.samples = [{ sketch: {}, amr: undefined }] as ProjectSample[];
      expect(store.isReadyToRun).toBe(false);
    });

    it("isProjectComplete returns true when all analysisStatus are complete", () => {
      const store = useProjectStore();
      store.project.status = { assign: "finished", microreact: "failed", network: "finished" };
      expect(store.isFinishedRun).toBe(true);
    });

    it("isProjectComplete returns false when not all analysisStatus are complete", () => {
      const store = useProjectStore();
      store.project.status = { assign: "started", microreact: "finished", network: "finished" };

      expect(store.isFinishedRun).toBe(false);
    });

    it("numOfStatus returns the number of analysisStatus", () => {
      const store = useProjectStore();
      store.project.status = { assign: "started", microreact: "finished", network: "finished" };

      expect(store.numOfStatus).toBe(3);
    });

    it("analysisProgressPercentage returns the correct percentage of complete analysisStatus", () => {
      const store = useProjectStore();
      store.project.status = { assign: "started", microreact: "finished", network: "finished" };
      expect(store.analysisProgressPercentage).toBe(Math.round((2 / 3) * 100));
    });
    it("startedRun returns true when project status is set", () => {
      const store = useProjectStore();
      store.project.status = { assign: "started", microreact: "finished", network: "finished" };
      expect(store.hasStartedAtLeastOneRun).toBe(true);
    });
    it("startedRun returns false when project status is not set", () => {
      const store = useProjectStore();
      store.project.status = undefined;
      expect(store.hasStartedAtLeastOneRun).toBe(false);
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
        this.onmessage = () => {};
      }

      postMessage(msg: any) {
        this.onmessage({
          data: {
            ...msg,
            type: "sketch"
          }
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
        status: MOCK_PROJECT.status
      });
      expect(store.hasStartedAtLeastOneRun).toBe(true);
    });

    it("should not upload duplicates when onFilesUpload is called", async () => {
      const store = useProjectStore();
      store.project.samples = [];

      store.onFilesUpload(mockFilesWithHashes);
      await flushPromises();
      store.onFilesUpload(mockFilesWithHashes[0]);
      await flushPromises();

      expect(store.project.samples.length).toBe(3);
    });
    it("should call worker and set fileSamples correctly when processFiles is called", async () => {
      const store = useProjectStore();
      store.project.samples = [];

      const workerPostMessageSpy = vitest.spyOn(MockWorker.prototype, "postMessage");

      await store.processFiles(mockFilesWithHashes);

      expect(store.project.samples).toEqual([
        { hash: mockFilesWithHashes[0].hash, filename: mockFilesWithHashes[0].name },
        { hash: mockFilesWithHashes[1].hash, filename: mockFilesWithHashes[1].name },
        { hash: mockFilesWithHashes[2].hash, filename: mockFilesWithHashes[2].name }
      ]);
      mockFilesWithHashes.forEach((file: any, index: any) => {
        expect(workerPostMessageSpy).toHaveBeenNthCalledWith(index + 1, {
          hash: file.hash,
          fileObject: file
        });
      });
    });
    it("should save & post amr data to server when handleWorkerResponse is called", async () => {
      const store = useProjectStore();
      store.project.id = "1";
      store.project.samples = [...mockFilesWithHashes];
      const eventData = {
        hash: mockFilesWithHashes[0].hash,
        result: JSON.stringify({ Penicillin: 0.24, Chloramphenicol: 0.24 }),
        type: WorkerResponseValueTypes.AMR
      };
      server.use(
        http.post(`${projectIndexUri}/${store.project.id}/${eventData.type}/${eventData.hash}`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(JSON.parse(eventData.result));
          return HttpResponse.text("");
        })
      );

      await store.handleWorkerResponse("sample1.fasta", {
        data: eventData
      } as any);

      expect(store.project.samples[0].amr).toEqual({ Penicillin: 0.24, Chloramphenicol: 0.24 });
    });
    it("should save & post sketch data to server when handleWorkerResponse is called", async () => {
      const store = useProjectStore();
      store.project.id = "1";
      store.project.samples = [...mockFilesWithHashes];
      const eventData = {
        hash: mockFilesWithHashes[0].hash,
        result: JSON.stringify({ filename: "sample1.fasta", md5: "sample1-md5" }),
        type: WorkerResponseValueTypes.SKETCH
      };
      server.use(
        http.post(`${projectIndexUri}/${store.project.id}/${eventData.type}/${eventData.hash}`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ sketch: JSON.parse(eventData.result), filename: "sample1.fasta" });
          return HttpResponse.text("");
        })
      );

      await store.handleWorkerResponse("sample1.fasta", {
        data: eventData
      } as any);

      expect(store.project.samples[0].sketch).toEqual({ filename: "sample1.fasta", md5: "sample1-md5" });
    });
    it("should remove sample from fileSamples when handleWorkerResponse fails & call toast.showErrorToast", async () => {
      const store = useProjectStore();
      store.project.id = "1";
      store.project.samples = [...mockFilesWithHashes];
      store.toast.showErrorToast = vitest.fn();
      const eventData = {
        hash: mockFilesWithHashes[0].hash,
        result: JSON.stringify({ Penicillin: 0.24, Chloramphenicol: 0.24 }),
        type: WorkerResponseValueTypes.AMR
      };
      server.use(
        http.post(`${projectIndexUri}/${store.project.id}/${eventData.type}/${eventData.hash}`, () =>
          HttpResponse.error()
        )
      );

      await store.handleWorkerResponse("sample1.fasta", { data: eventData } as any);

      expect(store.project.samples).toEqual(mockFilesWithHashes.slice(1));
      expect(store.toast.showErrorToast).toHaveBeenCalledWith(
        "Ensure uploaded sample file is correct or try again later."
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
        http.post(statusUri, () => HttpResponse.json({ data: { assign: "started" }, errors: [], status: "success" }))
      );

      await store.getAnalysisStatus();

      expect(store.stopPollingStatus).not.toHaveBeenCalled();
    });
    it("should call getClusterAssignResult when assign status changes to finished", async () => {
      const store = useProjectStore();
      store.getClusterAssignResult = vitest.fn();
      store.project.status = { assign: "started", microreact: "finished", network: "finished" };

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

      expect(store.project.status).toEqual({ assign: "failed", microreact: "failed", network: "failed" });
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
      expect(store.project.status).toEqual({ assign: "submitted", microreact: "submitted", network: "submitted" });
      samples.forEach((sample) => {
        expect(sample.hasRun).toBe(true);
      });
    });
    it("should not call pollAnalysisStatus & not change status when runAnalysis fails", () => {
      const store = useProjectStore();
      store.buildRunAnalysisPostBody = vitest.fn().mockReturnValue({ projectHash: "test-hash" });
      store.pollAnalysisStatus = vitest.fn();
      server.use(http.post("*", () => HttpResponse.error()));

      store.runAnalysis();

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
        }
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
      const analysisStatus: AnalysisStatus = { assign: "failed", network: "deferred", microreact: "waiting" };
      const store = useProjectStore();

      const stopPolling = await store.processStatusAndGetStopPolling(analysisStatus, "waiting");

      expect(stopPolling).toBe(true);
      expect(store.project.status).toStrictEqual({ assign: "failed", network: "failed", microreact: "failed" });
    });
  });
});
