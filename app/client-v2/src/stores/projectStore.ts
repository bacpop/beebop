import { getApiUrl } from "@/config";
import {
  COMPLETE_STATUS_TYPES,
  type AnalysisStatus,
  type ApiResponse,
  type Project,
  type ProjectSample,
  type WorkerResponse,
  WorkerResponseValueTypes
} from "@/types/projectTypes";
import { mande } from "mande";
import { defineStore } from "pinia";
import { Md5 } from "ts-md5";

const baseApi = mande(getApiUrl(), { credentials: "include" });

// TODO: add proper error handling. Maybe best to add error state attribute and watch accordingly cos of nested things interval/workers
export const useProjectStore = defineStore("project", {
  state: () => ({
    basicInfo: {} as Pick<Project, "id" | "name" | "timestamp">,
    fileSamples: [] as ProjectSample[],
    projectHash: "",
    isRun: false,
    analysisStatus: {} as AnalysisStatus,
    pollingIntervalId: null as ReturnType<typeof setInterval> | null
  }),
  getters: {
    isReadyToRun: (state) =>
      state.fileSamples.length > 0 && state.fileSamples.every((sample: ProjectSample) => sample.sketch && sample.amr),
    isProjectComplete: (state) => {
      const analysisStatusValues = Object.values(state.analysisStatus);
      return (
        analysisStatusValues.length > 0 && analysisStatusValues.every((value) => COMPLETE_STATUS_TYPES.includes(value))
      );
    },
    numOfStatus: (state) => Object.keys(state.analysisStatus).length,
    analysisProgressPercentage(state): number {
      return Math.round(
        (Object.values(state.analysisStatus).filter((value) => COMPLETE_STATUS_TYPES.includes(value)).length /
          this.numOfStatus) *
          100
      );
    }
  },
  actions: {
    async getProject(id: string) {
      this.$reset();
      try {
        const projectRes = await baseApi.get<ApiResponse<Project>>(`/project/${id}`);
        this.basicInfo = {
          id: projectRes.data.id,
          name: projectRes.data.name,
          timestamp: projectRes.data.timestamp
        };
        this.fileSamples = projectRes.data.samples;
        this.projectHash = projectRes.data.hash || "";

        if (projectRes.data.status) {
          this.isRun = true;
          this.analysisStatus = projectRes.data.status;
        }

        if (this.isRun && !this.isProjectComplete) {
          this.pollAnalysisStatus();
        }
      } catch (error) {
        // handle error
        console.error(error);
        return error;
      }
    },
    onFilesUpload(files: File | File[]) {
      const arrayFiles = Array.isArray(files) ? files : [files];
      const nonDuplicateFiles = arrayFiles.filter(
        (file: File) => !this.fileSamples.some((sample: ProjectSample) => sample.filename === file.name)
      );
      this.processFiles(nonDuplicateFiles);
    },
    async processFiles(files: File[]) {
      for (const file of files) {
        const content = await file.text();
        const fileHash = Md5.hashStr(content);
        this.fileSamples.push({ hash: fileHash, filename: file.name });

        // run web worker to get sketch and amr data and then post to server
        const worker = new Worker("/worker.js");
        worker.postMessage({ hash: fileHash, fileObject: file });

        worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
          await this.handleWorkerResponse(file.name, event);
        };
      }
    },
    async handleWorkerResponse(filename: string, event: MessageEvent<WorkerResponse>) {
      const { hash, result, type } = event.data;
      const parsedAmrOrSketch = JSON.parse(result);

      const matchedHashIndex = this.fileSamples.findIndex((sample: ProjectSample) => hash === sample.hash);
      if (matchedHashIndex !== -1) {
        this.fileSamples[matchedHashIndex][type] = parsedAmrOrSketch;
      }

      try {
        await baseApi.post(
          `/project/${this.basicInfo.id}/${type}/${hash}`,
          type === WorkerResponseValueTypes.AMR
            ? parsedAmrOrSketch
            : {
                sketch: parsedAmrOrSketch,
                filename
              }
        );
      } catch (error) {
        console.error(error);
        this.fileSamples.splice(matchedHashIndex, 1);
      }
    },
    // TODO: next PR to add this
    pollAnalysisStatus() {
      console.log("Polling");
    },
    // TODO: update to remove from api as well
    removeUploadedFile(index: number) {
      this.fileSamples.splice(index, 1);
    },
    // TODO: next PR to add this
    async runAnalysis() {
      console.log("Run");
      this.isRun = true;
    }
  }
});
