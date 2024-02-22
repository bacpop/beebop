import { AnalysisType } from "./../types/projectTypes";
import { getApiUrl } from "@/config";
import {
  COMPLETE_STATUS_TYPES,
  type AnalysisStatus,
  type ApiResponse,
  type Project,
  type ProjectSample,
  type AssignCluster,
  type ClusterInfo,
  type WorkerResponse,
  WorkerResponseValueTypes
} from "@/types/projectTypes";
import { mande } from "mande";
import { defineStore } from "pinia";
import { Md5 } from "ts-md5";

const baseApi = mande(getApiUrl(), { credentials: "include" });

// TODO: add proper error handling
export const useProjectStore = defineStore("project", {
  state: () => ({
    basicInfo: {} as Pick<Project, "id" | "name" | "timestamp">,
    fileSamples: [] as ProjectSample[],
    projectHash: "",
    isRun: false,
    analysisStatus: {} as AnalysisStatus,
    pollingIntervalId: null as ReturnType<typeof setInterval> | null,
    hadDownloadedZip: {
      microreact: false,
      network: false
    } as Record<AnalysisType, boolean>
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
    pollAnalysisStatus() {
      if (!this.pollingIntervalId) {
        const intervalId = setInterval(() => {
          this.getAnalysisStatus();
        }, 1500);
        this.pollingIntervalId = intervalId;
      }
    },
    async getAnalysisStatus() {
      const prevClusterAssign = this.analysisStatus.assign;
      let stopPolling = false;
      try {
        const statusRes = await baseApi.post<ApiResponse<AnalysisStatus>>("/status", { hash: this.projectHash });
        this.analysisStatus = statusRes.data;
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
          projectHash: this.projectHash
        });

        Object.values(assignClusterRes.data).forEach((clusterInfo: ClusterInfo) => {
          const matchedHashIndex = this.fileSamples.findIndex(
            (sample: ProjectSample) => clusterInfo.hash === sample.hash
          );
          if (matchedHashIndex !== -1) {
            this.fileSamples[matchedHashIndex].cluster = clusterInfo.cluster;
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
    onFilesUpload(files: File | File[]) {
      const arrayFiles = Array.isArray(files) ? files : [files];
      const nonDuplicateFiles = arrayFiles.filter(
        (file: File) => !this.fileSamples.some((sample: ProjectSample) => sample.filename === file.name)
      );
      this.processFiles(nonDuplicateFiles);
    },
    async processFiles(files: File[]) {
      files.forEach((file: File) => {
        file.text().then((content: string) => {
          const fileHash = Md5.hashStr(content);
          this.fileSamples.push({ hash: fileHash, filename: file.name });

          // run web worker to get sketch and amr data and then post to server
          const worker = new Worker("/worker.js");
          worker.postMessage({ hash: fileHash, fileObject: file });
          worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
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
                      filename: file.name
                    }
              );
            } catch (error) {
              console.error(error);
            }
          };
        });
      });
    },
    // TODO: update to remove from api as well
    removeUploadedFile(index: number) {
      this.fileSamples.splice(index, 1);
    },
    async runAnalysis() {
      const body = this.buildRunAnalysisPostBody();
      try {
        await baseApi.post("/poppunk", body);
        this.projectHash = body.projectHash;
        this.isRun = true;
      } catch (error) {
        console.error("Error running analysis", error);
        return;
      }

      this.analysisStatus = { assign: "submitted", microreact: "submitted", network: "submitted" };
      this.pollAnalysisStatus();
    },
    buildRunAnalysisPostBody() {
      const sketches: Record<string, unknown> = {};
      const names: Record<string, unknown> = {};
      let projectHashKey = "";
      this.fileSamples
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .forEach((sample: ProjectSample) => {
          projectHashKey += sample.hash + sample.filename;
          sketches[sample.hash] = sample.sketch;
          names[sample.hash] = sample.filename;
        }, "");
      const projectHash = Md5.hashStr(projectHashKey);

      return { projectHash, names, sketches, projectId: this.basicInfo.id };
    },
    async downloadZip(type: AnalysisType, cluster: number) {
      try {
        const res = await baseApi.post<Response, "response">(
          "downloadZip",
          {
            type,
            cluster,
            projectHash: this.projectHash
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

        this.hadDownloadedZip[type] = true;
      } catch (error) {
        console.error(error);
      }
    },
    // TODO
    async onMicroReactVisit(cluster: number) {
      console.log("Microreact visit");
    }
  }
});
