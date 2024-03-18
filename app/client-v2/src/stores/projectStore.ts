import { getApiUrl } from "@/config";
import {
  COMPLETE_STATUS_TYPES,
  type AnalysisStatus,
  type ApiResponse,
  type Project,
  type ProjectSample,
  type WorkerResponse,
  WorkerResponseValueTypes,
  AnalysisType,
  type AssignCluster,
  type ClusterInfo
} from "@/types/projectTypes";
import { mande } from "mande";
import { defineStore } from "pinia";
import { useToast } from "primevue/usetoast";
import { Md5 } from "ts-md5";

const baseApi = mande(getApiUrl(), { credentials: "include" });

// TODO: add proper error handling. Maybe best to add error state attribute and watch accordingly cos of nested things interval/workers
export const useProjectStore = defineStore("project", {
  state: () => ({
    project: {} as Project,
    pollingIntervalId: null as ReturnType<typeof setInterval> | null,
    toast: useToast() as ReturnType<typeof useToast>
  }),

  getters: {
    isReadyToRun: (state) =>
      state.project.samples.length > 0 &&
      state.project.samples.every((sample: ProjectSample) => sample.sketch && sample.amr),
    isProjectComplete: (state) => {
      const analysisStatusValues = Object.values(state.project.status || {});
      return (
        analysisStatusValues.length > 0 && analysisStatusValues.every((value) => COMPLETE_STATUS_TYPES.includes(value))
      );
    },
    numOfStatus: (state) => Object.keys(state.project.status || {}).length,
    startedRun: (state) => !!state.project.status,
    analysisProgressPercentage(state): number {
      return Math.round(
        (Object.values(state.project.status || {}).filter((value) => COMPLETE_STATUS_TYPES.includes(value)).length /
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
        this.project = projectRes.data;

        if (this.startedRun && !this.isProjectComplete) {
          this.pollAnalysisStatus();
        }
      } catch (error) {
        // handle error
        console.error(error);
        return error;
      }
    },
    showErrorToast(msg: string) {
      this.toast.add({
        severity: "error",
        summary: "Error Occurred",
        detail: msg,
        life: 3000
      });
    },

    onFilesUpload(files: File | File[]) {
      const arrayFiles = Array.isArray(files) ? files : [files];
      const nonDuplicateFiles = arrayFiles.filter(
        (file: File) => !this.project.samples.some((sample: ProjectSample) => sample.filename === file.name)
      );
      this.processFiles(nonDuplicateFiles);
    },

    async processFiles(files: File[]) {
      for (const file of files) {
        const content = await file.text();
        const fileHash = Md5.hashStr(content);
        this.project.samples.push({ hash: fileHash, filename: file.name });

        // run web worker to get sketch and amr data and then post to server
        const worker = new Worker("/worker.js");
        worker.postMessage({ hash: fileHash, fileObject: file });

        worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
          this.handleWorkerResponse(file.name, event);
        };
        worker.onerror = (error) => {
          console.error(error);
          this.showErrorToast("Ensure uploaded sample file is correct or try again later.");
        };
      }
    },

    async handleWorkerResponse(filename: string, event: MessageEvent<WorkerResponse>) {
      const { hash, result, type } = event.data;
      const parsedAmrOrSketch = JSON.parse(result);

      const matchedHashIndex = this.project.samples.findIndex((sample: ProjectSample) => hash === sample.hash);
      if (matchedHashIndex !== -1) {
        this.project.samples[matchedHashIndex][type] = parsedAmrOrSketch;
      }

      try {
        await baseApi.post(
          `/project/${this.project.id}/${type}/${hash}`,
          type === WorkerResponseValueTypes.AMR
            ? parsedAmrOrSketch
            : {
                sketch: parsedAmrOrSketch,
                filename
              }
        );
      } catch (error) {
        console.error(error);
        this.showErrorToast("Ensure uploaded sample file is correct or try again later.");
        if (matchedHashIndex !== -1) {
          this.project.samples.splice(matchedHashIndex, 1);
        }
      }
    },

    pollAnalysisStatus() {
      if (!this.pollingIntervalId) {
        const intervalId = setInterval(async () => {
          await this.getAnalysisStatus();
        }, 2000);
        this.pollingIntervalId = intervalId;
      }
    },

    async getAnalysisStatus() {
      const prevClusterAssign = this.project.status?.assign;
      let stopPolling = false;
      try {
        const statusRes = await baseApi.post<ApiResponse<AnalysisStatus>>("/status", { hash: this.project.hash });
        this.project.status = statusRes.data;
        if (statusRes.data.assign === "finished" && prevClusterAssign !== "finished") {
          await this.getClusterAssignResult();
        }
        if (
          COMPLETE_STATUS_TYPES.includes(statusRes.data.network) &&
          COMPLETE_STATUS_TYPES.includes(statusRes.data.microreact)
        ) {
          stopPolling = true;
        }
      } catch (error) {
        console.error(error);
        stopPolling = true;
      } finally {
        if (stopPolling) {
          this.stopPollingStatus();
        }
      }
    },

    async getClusterAssignResult() {
      try {
        const assignClusterRes = await baseApi.post<ApiResponse<AssignCluster>>("/assignResult", {
          projectHash: this.project.hash
        });

        Object.values(assignClusterRes.data).forEach((clusterInfo: ClusterInfo) => {
          const matchedHashIndex = this.project.samples.findIndex(
            (sample: ProjectSample) => clusterInfo.hash === sample.hash
          );
          if (matchedHashIndex !== -1) {
            this.project.samples[matchedHashIndex].cluster = clusterInfo.cluster;
          }
        });
      } catch (error) {
        console.error(error);
      }
    },

    stopPollingStatus() {
      if (this.pollingIntervalId) {
        clearInterval(this.pollingIntervalId);
        this.pollingIntervalId = null;
      }
    },
    // TODO: update to remove from api as well
    // removeUploadedFile(index: number) {
    //   // this.fileSamples.splice(index, 1);
    // },

    async runAnalysis() {
      const body = this.buildRunAnalysisPostBody();
      try {
        await baseApi.post("/poppunk", body);

        this.project.hash = body.projectHash;
        this.project.status = { assign: "submitted", microreact: "submitted", network: "submitted" };
        this.pollAnalysisStatus();
      } catch (error) {
        console.error("Error running analysis", error);
        this.showErrorToast("Error running analysis. Try again later.");
        return;
      }
    },

    buildRunAnalysisPostBody() {
      const sketches: Record<string, unknown> = {};
      const names: Record<string, unknown> = {};
      let projectHashKey = "";
      this.project.samples
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .forEach((sample: ProjectSample) => {
          projectHashKey += sample.hash + sample.filename;
          sketches[sample.hash] = sample.sketch;
          names[sample.hash] = sample.filename;
        }, "");
      const projectHash = Md5.hashStr(projectHashKey);

      return { projectHash, names, sketches, projectId: this.project.id };
    },

    async downloadZip(type: AnalysisType, cluster: string) {
      try {
        const res = await baseApi.post<Response, "response">(
          "downloadZip",
          {
            type,
            cluster,
            projectHash: this.project.hash
          },
          { responseAs: "response", headers: { "Content-Type": "application/json" } }
        );

        const blob = await res.blob().catch(() => {
          throw new Error("Error retrieving data from response");
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${type}_cluster${cluster}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error(error);
      }
    }
  }
});
