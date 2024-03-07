import { projectIndexUri } from "@/mocks/handlers/projectHandlers";
import { MOCK_PROJECT } from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import { useProjectStore } from "@/stores/projectStore";
import { WorkerResponseValueTypes, type ProjectSample } from "@/types/projectTypes";
import { flushPromises } from "@vue/test-utils";
import { HttpResponse, http } from "msw";
import { createPinia, setActivePinia } from "pinia";
import { Md5 } from "ts-md5";

describe("projectStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("getters", () => {
    it("isReadyToRun returns true when all samples have sketch and amr", () => {
      const store = useProjectStore();
      store.fileSamples = [{ sketch: {}, amr: { Chloramphenicol: 0.24 } }] as ProjectSample[];
      expect(store.isReadyToRun).toBe(true);
    });

    it("isReadyToRun returns false when not all samples have sketch and amr", () => {
      const store = useProjectStore();
      store.fileSamples = [{ sketch: {}, amr: undefined }] as ProjectSample[];
      expect(store.isReadyToRun).toBe(false);
    });

    it("isProjectComplete returns true when all analysisStatus are complete", () => {
      const store = useProjectStore();
      store.analysisStatus = { assign: "finished", microreact: "failed", network: "finished" };
      expect(store.isProjectComplete).toBe(true);
    });

    it("isProjectComplete returns false when not all analysisStatus are complete", () => {
      const store = useProjectStore();
      store.analysisStatus = { assign: "started", microreact: "finished", network: "finished" };

      expect(store.isProjectComplete).toBe(false);
    });

    it("numOfStatus returns the number of analysisStatus", () => {
      const store = useProjectStore();
      store.analysisStatus = { assign: "started", microreact: "finished", network: "finished" };

      expect(store.numOfStatus).toBe(3);
    });

    it("analysisProgressPercentage returns the correct percentage of complete analysisStatus", () => {
      const store = useProjectStore();
      store.analysisStatus = { assign: "started", microreact: "finished", network: "finished" };

      expect(store.analysisProgressPercentage).toBe(Math.round((2 / 3) * 100));
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
      store.projectHash = "hash-will-be-overwritten";

      await store.getProject("1");

      expect(store.projectHash).toBe(MOCK_PROJECT.hash);
      expect(store.basicInfo).toEqual({
        id: MOCK_PROJECT.id,
        name: MOCK_PROJECT.name,
        timestamp: MOCK_PROJECT.timestamp
      });
      expect(store.fileSamples).toEqual(MOCK_PROJECT.samples);
      expect(store.isRun).toBe(true);
      expect(store.analysisStatus).toEqual(MOCK_PROJECT.status);
    });

    it("should not upload duplicates when onFilesUpload is called", async () => {
      const store = useProjectStore();

      store.onFilesUpload(mockFilesWithHashes);
      await flushPromises();
      store.onFilesUpload(mockFilesWithHashes[0]);
      await flushPromises();

      expect(store.fileSamples.length).toBe(3);
    });
    it("should call worker and set fileSamples correctly when processFiles is called", async () => {
      const store = useProjectStore();

      const workerPostMessageSpy = vitest.spyOn(MockWorker.prototype, "postMessage");

      await store.processFiles(mockFilesWithHashes);

      expect(store.fileSamples).toEqual([
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
      store.basicInfo.id = "1";
      store.fileSamples = [...mockFilesWithHashes];
      const eventData = {
        hash: mockFilesWithHashes[0].hash,
        result: JSON.stringify({ Penicillin: 0.24, Chloramphenicol: 0.24 }),
        type: WorkerResponseValueTypes.AMR
      };
      server.use(
        http.post(
          `${projectIndexUri}/${store.basicInfo.id}/${eventData.type}/${eventData.hash}`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual(JSON.parse(eventData.result));
            return HttpResponse.text("");
          }
        )
      );

      await store.handleWorkerResponse("sample1.fasta", {
        data: eventData
      } as any);

      expect(store.fileSamples[0].amr).toEqual({ Penicillin: 0.24, Chloramphenicol: 0.24 });
    });
    it("should save & post sketch data to server when handleWorkerResponse is called", async () => {
      const store = useProjectStore();
      store.basicInfo.id = "1";
      store.fileSamples = [...mockFilesWithHashes];
      const eventData = {
        hash: mockFilesWithHashes[0].hash,
        result: JSON.stringify({ filename: "sample1.fasta", md5: "sample1-md5" }),
        type: WorkerResponseValueTypes.SKETCH
      };
      server.use(
        http.post(
          `${projectIndexUri}/${store.basicInfo.id}/${eventData.type}/${eventData.hash}`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual({ sketch: JSON.parse(eventData.result), filename: "sample1.fasta" });
            return HttpResponse.text("");
          }
        )
      );

      await store.handleWorkerResponse("sample1.fasta", {
        data: eventData
      } as any);

      expect(store.fileSamples[0].sketch).toEqual({ filename: "sample1.fasta", md5: "sample1-md5" });
    });
    it("should remove sample from fileSamples when handleWorkerResponse fails", async () => {
      const store = useProjectStore();
      store.basicInfo.id = "1";
      store.fileSamples = [...mockFilesWithHashes];
      const eventData = {
        hash: mockFilesWithHashes[0].hash,
        result: JSON.stringify({ Penicillin: 0.24, Chloramphenicol: 0.24 }),
        type: WorkerResponseValueTypes.AMR
      };
      server.use(
        http.post(`${projectIndexUri}/${store.basicInfo.id}/${eventData.type}/${eventData.hash}`, () =>
          HttpResponse.error()
        )
      );

      await store.handleWorkerResponse("sample1.fasta", { data: eventData } as any);

      expect(store.fileSamples).toEqual(mockFilesWithHashes.slice(1));
    });
  });
});
