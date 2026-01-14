import { useToastService } from "@/composables/useToastService";
import { getApiUrl } from "@/config";
import {
  AnalysisType,
  COMPLETE_STATUS_TYPES,
  type AMRMetadataCsv,
  type AnalysisStatus,
  type ApiResponse,
  type ClusterInfo,
  type HashedFile,
  type Project,
  type ProjectSample,
  type StatusTypes,
  type Sublineage,
  type WorkerResponse
} from "@/types/projectTypes";
import { mande } from "mande";
import { defineStore } from "pinia";
import { Md5 } from "ts-md5";
import { useSpeciesStore, type SketchKmerArguments } from "./speciesStore";
import { toRaw } from "vue";
import { convertAmrForCsv } from "@/utils/projectCsvUtils";

const baseApi = mande(getApiUrl(), { credentials: "include" });

export const useProjectStore = defineStore("project", {
  state: () => ({
    project: {} as Project,
    pollingIntervalId: null as ReturnType<typeof setInterval> | null,
    toast: useToastService() as ReturnType<typeof useToastService>,
    uploadingPercentage: null as number | null
  }),

  getters: {
    isReadyToRun: (state) =>
      state.project.samples.length > 0 &&
      state.project.samples.every((sample: ProjectSample) => sample.sketch && sample.amr),
    separatedStatuses(state): {
      fullStatuses: Partial<Omit<AnalysisStatus, "visualiseClusters">>;
      visualiseClusters: Record<string, StatusTypes>;
    } {
      const { visualiseClusters, ...status } = state.project.status || {};
      return { fullStatuses: status, visualiseClusters: visualiseClusters ?? {} };
    },
    statusValues(): StatusTypes[] {
      return [
        ...Object.values(this.separatedStatuses.fullStatuses),
        ...Object.values(this.separatedStatuses.visualiseClusters)
      ];
    },
    isFinishedRun(): boolean {
      return this.statusValues.length > 0 && this.statusValues.every((value) => COMPLETE_STATUS_TYPES.includes(value));
    },
    numOfFullStatus(): number {
      return Object.keys(this.separatedStatuses.fullStatuses).length;
    },
    hasStartedAtLeastOneRun: (state) => !!state.project.status,
    isRunning(): boolean {
      return this.hasStartedAtLeastOneRun && !this.isFinishedRun;
    },
    completeVisualiseNumerator(): number {
      const { visualiseClusters } = this.separatedStatuses;
      const visualiseClustersStatusValues = Object.values(visualiseClusters);
      return visualiseClustersStatusValues.length > 0
        ? visualiseClustersStatusValues.filter((value) => COMPLETE_STATUS_TYPES.includes(value)).length /
            visualiseClustersStatusValues.length
        : 0;
    },
    analysisProgressPercentage(): number {
      const {
        fullStatuses: { assign, sublineageAssign }
      } = this.separatedStatuses;

      const isAssignComplete = Number(COMPLETE_STATUS_TYPES.includes(assign as StatusTypes));
      const isSublineageAssignComplete = Number(COMPLETE_STATUS_TYPES.includes(sublineageAssign as StatusTypes));
      return this.numOfFullStatus
        ? Math.round(
            ((isAssignComplete + isSublineageAssignComplete + this.completeVisualiseNumerator) / this.numOfFullStatus) *
              100
          )
        : 0;
    },
    firstAssignedCluster(state): string | undefined {
      return state.project.samples.find((sample: ProjectSample) => !!sample.cluster)?.cluster;
    }
  },

  actions: {
    async getProject(id: string) {
      this.$reset();
      try {
        const projectRes = await baseApi.get<ApiResponse<Project>>(`/project/${id}`);
        this.project = projectRes.data;

        if (this.hasStartedAtLeastOneRun && !this.isFinishedRun) {
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
        (file: File) => !this.project.samples.some((sample: ProjectSample) => sample.filename === file.name)
      );

      if (nonDuplicateFiles.length === 0) {
        this.toast.showErrorToast("No new files to upload.");
        return;
      }
      this.processFiles(nonDuplicateFiles);
    },

    async processFiles(files: File[]) {
      this.uploadingPercentage = 0;
      const hashedFileBatches = await this.batchFilesForProcessing(files);
      this.processFileBatches(hashedFileBatches);
    },
    async batchFilesForProcessing(files: File[]) {
      const batchSize = 5; // found to be best balance of throughput and memory usage
      const hashedFiles: HashedFile[] = await Promise.all(
        files.map(async (file) => {
          const content = await file.text();
          const fileHash = Md5.hashStr(content);
          return { hash: fileHash, filename: file.name, file };
        })
      );
      const hashedFileBatches: HashedFile[][] = [];
      for (let i = 0; i < hashedFiles.length; i += batchSize) {
        hashedFileBatches.push(hashedFiles.slice(i, i + batchSize));
      }
      return hashedFileBatches;
    },
    async processFileBatches(hashedFileBatches: HashedFile[][]) {
      const maxWorkers = this.getOptimalWorkerCount();
      const activeBatches: Set<Promise<void>> = new Set();
      const speciesStore = useSpeciesStore();

      let uploadPercentNumerator = 0;
      for (const hashedFileBatch of hashedFileBatches) {
        if (activeBatches.size >= maxWorkers) {
          await Promise.race(activeBatches); // wait for at least 1 batch to finish
        }
        const batchPromise = this.computeAmrAndSketch(
          hashedFileBatch,
          toRaw(speciesStore.getSketchKmerArguments(this.project.species))
        );
        activeBatches.add(batchPromise);

        batchPromise
          .catch(() => console.error("error processing batch"))
          .finally(() => {
            activeBatches.delete(batchPromise);
            uploadPercentNumerator++;
            this.uploadingPercentage = Math.round((uploadPercentNumerator / hashedFileBatches.length) * 100);
          });
      }
    },
    getOptimalWorkerCount() {
      return Math.floor(navigator.hardwareConcurrency * 0.5) || 4;
    },
    async computeAmrAndSketch(hashedFiles: HashedFile[], sketchKmerArguments: SketchKmerArguments): Promise<void> {
      return new Promise((resolve, reject) => {
        const worker = new Worker("/worker.js");
        worker.postMessage({
          hashedFiles,
          sketchKmerArguments
        });

        worker.onmessage = async (event: MessageEvent<WorkerResponse[]>) => {
          this.handleWorkerResponse(event.data);
          worker.terminate();
          resolve();
        };

        worker.onerror = (error) => {
          console.error(error);
          this.toast.showErrorToast("Ensure uploaded sample files are correct, or try again later.");
          worker.terminate();
          reject();
        };
      });
    },
    async handleWorkerResponse(samples: WorkerResponse[]) {
      this.project.samples.push(...samples);
      try {
        await baseApi.post(`/project/${this.project.id}/sample`, samples);
      } catch (error) {
        console.error(error);
        this.toast.showErrorToast("Ensure uploaded sample files is correct or try again later.");
        this.project.samples.splice(-samples.length);
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
      let stopPolling = false;
      try {
        const statusRes = await baseApi.post<ApiResponse<AnalysisStatus>>("/status", { hash: this.project.hash });
        stopPolling = await this.processStatusAndGetStopPolling(statusRes.data, this.project.status);
      } catch (error) {
        this.toast.showErrorToast("Error fetching analysis status. Try refreshing the page, or create a new project.");
        console.error(error);
        stopPolling = true;
      } finally {
        if (stopPolling) {
          this.stopPollingStatus();
        }
      }
    },
    async processStatusAndGetStopPolling(
      data: AnalysisStatus,
      prevStatus: AnalysisStatus | undefined
    ): Promise<boolean> {
      const { assign, visualise, visualiseClusters, sublineageAssign } = data;
      this.project.status = data;
      if (COMPLETE_STATUS_TYPES.includes(assign) && prevStatus?.assign !== "finished") {
        await this.getClusterAssignResult();
      }

      if (assign === "failed") {
        this.project.status = {
          assign: "failed",
          visualise: "failed",
          sublineageAssign: "failed",
          visualiseClusters: {}
        };
        return true;
      }

      if (
        COMPLETE_STATUS_TYPES.includes(sublineageAssign as StatusTypes) &&
        COMPLETE_STATUS_TYPES.includes(prevStatus?.sublineageAssign as StatusTypes) === false
      ) {
        await this.getSublineageAssignResult();
      }

      return [visualise, ...Object.values(visualiseClusters)].every((status) => COMPLETE_STATUS_TYPES.includes(status));
    },
    async getSublineageAssignResult() {
      try {
        const sublineagesRes = await baseApi.post<ApiResponse<Record<string, Sublineage>>>("/sublineageAssignResult", {
          projectHash: this.project.hash
        });

        Object.entries(sublineagesRes.data).forEach(([hash, sublineage]) => {
          const matchedHashIndex = this.project.samples.findIndex((sample) => hash === sample.hash);
          if (matchedHashIndex !== -1) {
            this.project.samples[matchedHashIndex].sublineage = sublineage;
          }
        });
      } catch (error) {
        console.error(error);
      }
    },

    async getClusterAssignResult() {
      try {
        const assignClusterRes = await baseApi.post<ApiResponse<Record<string, ClusterInfo>>>("/assignResult", {
          projectHash: this.project.hash
        });

        Object.values(assignClusterRes.data).forEach((clusterInfo: ClusterInfo) => {
          const matchedHashIndex = this.project.samples.findIndex(
            (sample: ProjectSample) => clusterInfo.hash === sample.hash
          );

          if (matchedHashIndex !== -1) {
            this.project.samples[matchedHashIndex].cluster = clusterInfo.cluster;
            this.project.samples[matchedHashIndex].failReasons = clusterInfo.failReasons;
            this.project.samples[matchedHashIndex].failType = clusterInfo.failType;
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
    async removeUploadedFile(index: number) {
      try {
        await baseApi.patch(`/project/${this.project.id}/sample/${this.project.samples[index].hash}/delete`, {
          filename: this.project.samples[index].filename
        });
        this.project.samples.splice(index, 1);
      } catch (error) {
        console.error(error);
        this.toast.showErrorToast("Error removing file. Try again later.");
      }
    },

    async runAnalysis() {
      this.project.status = {
        assign: "submitted",
        visualise: "submitted",
        visualiseClusters: {},
        sublineageAssign: "submitted"
      };
      this.project.samples.forEach((sample: ProjectSample) => (sample.hasRun = true));
      const body = this.buildRunAnalysisPostBody();
      try {
        await baseApi.post("/poppunk", body);

        this.project.hash = body.projectHash;
        this.pollAnalysisStatus();
      } catch (error) {
        console.error("Error running analysis", error);
        this.toast.showErrorToast("Error running analysis. Try again later.");
        this.project.status = undefined;
        this.project.samples.forEach((sample: ProjectSample) => (sample.hasRun = false));
        return;
      }
    },

    buildRunAnalysisPostBody() {
      const sketches: Record<string, unknown> = {};
      const names: Record<string, unknown> = {};
      const amrForMetadataCsv: AMRMetadataCsv[] = [];
      let projectHashKey = "";
      this.project.samples
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .forEach((sample: ProjectSample) => {
          projectHashKey += sample.hash + sample.filename;
          sketches[sample.hash] = sample.sketch;
          names[sample.hash] = sample.filename;
          amrForMetadataCsv.push({ ID: sample.hash, ...convertAmrForCsv(sample.amr!!) });
        }, "");
      const projectHash = Md5.hashStr(projectHashKey);

      return {
        projectHash,
        names,
        sketches,
        projectId: this.project.id,
        species: this.project.species,
        amrForMetadataCsv
      };
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
        this.toast.showErrorToast("Error downloading zip file. Try again later.");
      }
    }
  }
});
