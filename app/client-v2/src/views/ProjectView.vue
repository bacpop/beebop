<script setup lang="ts">
import { getApiUrl } from "@/config";
import {
  WorkerResponseValueTypes,
  type ApiResponse,
  type ProjectSample,
  type WorkerResponse,
  type AnalysisStatus,
  type Project,
  type AssignCluster,
  type ClusterInfo
} from "@/types/projectTypes";
import { useFetch } from "@vueuse/core";
import type { FileUploadUploaderEvent } from "primevue/fileupload";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Md5 } from "ts-md5";
import ProgressBar from "primevue/progressbar";
import { useProjectStore } from "@/stores/projectStore";

const route = useRoute();
const apiUrl = getApiUrl();
const store = useProjectStore();
store.getProject(route.params.id as string);
const {
  data: project,
  error,
  isFetching,
  onFetchResponse
} = useFetch(apiUrl + `/project/${route.params?.id}`, {
  credentials: "include"
}).json<ApiResponse<Project>>();
const fileSamples = ref<ProjectSample[]>([]);
const projectHash = ref("");
const isRun = ref(false);
const analysisStatus = ref<AnalysisStatus>();
const pollingStatusTimer = ref<any>(null);
// TODO: all sketch and amr data is ready
const isReadyToRun = computed(() => {
  return fileSamples.value.every((sample: ProjectSample) => sample.sketch && sample.amr);
});
const completeProject = computed(() => {
  if (!project.value?.data.status) {
    return false;
  }
  return Object.values(project.value.data.status).every((value) => ["finished", "failed"].includes(value));
});
const analysisProgress = computed(() => {
  return Math.round(
    (Object.values(analysisStatus.value || {}).filter((value) => ["finished", "failed"].includes(value)).length / 3) *
      100
  );
});

// TODO: double check logic and move all to store
onFetchResponse((res) => {
  if (res.ok) {
    fileSamples.value = project.value?.data.samples || [];
    projectHash.value = project.value?.data.hash || "";
    isRun.value = project.value?.data?.status !== undefined;
    analysisStatus.value = project.value?.data?.status;
    if (isRun.value && !completeProject.value) {
      pollStatus();
    }
  }
});

const onUpload = (files: File[] | File) => {
  const arrayFiles = Array.isArray(files) ? files : [files];

  const nonDuplicateFiles = arrayFiles.filter(
    (file: File) => !fileSamples.value.some((sample: ProjectSample) => sample.filename === file.name)
  );
  processFiles(nonDuplicateFiles);
};
const runAnalysis = async () => {
  console.log("Run Analysis");
  const sketches: Record<string, unknown> = {};
  const names: Record<string, unknown> = {};
  let projectHashKey = "";
  fileSamples.value
    .sort((a, b) => a.filename.localeCompare(b.filename))
    .forEach((sample: ProjectSample) => {
      projectHashKey += sample.hash + sample.filename;
      sketches[sample.hash] = sample.sketch;
      names[sample.hash] = sample.filename;
    }, "");
  const pHash = Md5.hashStr(projectHashKey);
  projectHash.value = pHash;

  isRun.value = true;

  const { error } = await useFetch(apiUrl + `/poppunk`, {
    credentials: "include"
  })
    .post({ projectId: route.params?.id, projectHash: projectHash.value, names, sketches })
    .json();
  // todo error handle
  if (error.value) {
    console.error("Error running analysis", error);
    return;
  }
  analysisStatus.value = { assign: "submitted", microreact: "submitted", network: "submitted" };
  pollStatus();
};
const pollStatus = () => {
  if (!pollingStatusTimer.value) {
    const interval = setInterval(() => {
      getStatus();
    }, 1500);
    pollingStatusTimer.value = interval;
  }
};

const getStatus = async () => {
  const prevAssign = analysisStatus.value?.assign;
  let stopPolling = false;
  const { error, data } = await useFetch(apiUrl + "/status", {
    credentials: "include"
  })
    .post({ hash: projectHash.value })
    .json<ApiResponse<AnalysisStatus>>();
  if (data.value) {
    analysisStatus.value = data.value.data;
    if (data.value.data.assign === "finished" && prevAssign !== "finished") {
      await getClusterAssignResult();
    }
    if (
      (data.value.data.network === "finished" || data.value.data.network === "failed") &&
      (data.value.data.microreact === "finished" || data.value.data.microreact === "failed")
    ) {
      stopPolling = true;
    }
  } else {
    stopPolling = true;
  }
  if (stopPolling) {
    await stopStatusPolling();
  }
};
const getClusterAssignResult = async () => {
  const { error, data } = await useFetch(apiUrl + `/assignResult`, {
    credentials: "include"
  })
    .post({ projectHash: projectHash.value })
    .json<ApiResponse<AssignCluster>>();

  if (data.value) {
    Object.values(data.value.data).forEach((clusterInfo: ClusterInfo) => {
      const matchedHashIndex = fileSamples.value.findIndex((sample: ProjectSample) => clusterInfo.hash === sample.hash);
      if (matchedHashIndex !== -1) {
        fileSamples.value[matchedHashIndex].cluster = clusterInfo.cluster;
      }
    });
  }
};
const stopStatusPolling = async () => {
  clearInterval(pollingStatusTimer.value);
  pollingStatusTimer.value = null;
};
const removeUploadedFile = (index: number) => {
  fileSamples.value.splice(index, 1);
};
const processFiles = async (files: File[]) => {
  files.forEach((file: File) => {
    file.text().then((content: string) => {
      const fileHash = Md5.hashStr(content);
      fileSamples.value.push({ hash: fileHash, filename: file.name });
      const worker = new Worker("/worker.js");
      worker.postMessage({ hash: fileHash, fileObject: file });
      worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
        const { hash, result, type } = event.data;
        const parsedResult = JSON.parse(result);

        const matchedHashIndex = fileSamples.value.findIndex((sample: ProjectSample) => hash === sample.hash);
        if (matchedHashIndex !== -1) {
          fileSamples.value[matchedHashIndex][type] = parsedResult;
        }
        // TODO: error handle
        if (type === WorkerResponseValueTypes.AMR) {
          const { error } = await useFetch(apiUrl + `/project/${route.params?.id}/amr/${hash}`, {
            credentials: "include"
          })
            .post(parsedResult)
            .json();
        } else {
          const { error } = await useFetch(apiUrl + `/project/${route.params?.id}/sketch/${hash}`, {
            credentials: "include"
          })
            .post({ sketch: parsedResult, filename: file.name })
            .json();
        }
      };
    });
  });
};
</script>

<template>
  <div v-if="isFetching">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else-if="project" class="single-project-card">
    <div class="flex flex-column gap-1 mb-3">
      <span class="text-3xl font-bold">{{ project.data?.name }}</span>
      <span class="text-color-secondary">Upload genomics data and run analysis on them</span>
    </div>
    <div class="surface-card p-4 shadow-2 border-round">
      <div v-if="isRun">
        <DataTable :value="fileSamples" tableStyle="min-width: 50rem">
          <template #header>
            <div v-if="analysisProgress !== 100">
              <div class="mb-2">Completed {{ analysisProgress }} % of analysis</div>
              <ProgressBar :value="analysisProgress"></ProgressBar>
            </div>
            <!-- TODO: update with network tab too -->
            <div v-else class="h-1rem"></div>
          </template>
          <Column field="filename" header="File Name"></Column>
          <Column field="sketch" header="Sketch">
            <template #body="props">
              <Tag v-if="props.data.sketch" value="done" severity="success" />
              <Tag v-else value="pending" severity="warning" />
            </template>
          </Column>
          <!-- TODO: AMR display   -->
          <Column field="amr" header="AMR">
            <template #body="props">
              <Tag v-if="props.data.amr" value="done" severity="success" />
              <Tag v-else value="pending" severity="warning" />
            </template>
          </Column>
          <Column field="cluster" header="Cluster #">
            <template #body="props">
              <span v-if="props.data.cluster"> {{ props.data.cluster }}</span>
              <Tag v-else value="pending" severity="warning" /> </template
          ></Column>
          <Column field="netowork" header="Network">
            <template #body="">
              <Tag v-if="analysisStatus?.microreact === 'finished'" value="done" severity="success" />
              <Tag v-else-if="analysisStatus?.microreact === 'failed'" value="failed" severity="danger" />
              <Tag v-else value="pending" severity="warning" />
            </template>
          </Column>
          <Column field="microreact" header="Microreact">
            <template #body="">
              <Tag v-if="analysisStatus?.network === 'finished'" value="done" severity="success" />
              <Tag v-else-if="analysisStatus?.network === 'failed'" value="failed" severity="danger" />
              <Tag v-else value="pending" severity="warning" />
            </template>
          </Column>
        </DataTable>
      </div>
      <div v-else>
        <FileUpload
          name="genomics[]"
          custom-upload
          auto
          @uploader="onUpload($event.files)"
          :multiple="true"
          accept=".fa, .fasta"
        >
          <template #header="{ chooseCallback }">
            <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
              <Button label="Upload" outlined icon="pi pi-upload" @click="chooseCallback()" />
              <Button label="Run Analysis" outlined @click="runAnalysis" :disabled="!isReadyToRun" />
            </div>
          </template>
          <template #content>
            <div v-if="fileSamples && fileSamples.length > 0">
              <DataTable :value="fileSamples" tableStyle="min-width: 50rem">
                <Column field="filename" header="File Name"></Column>
                <Column field="sketch" header="Sketch">
                  <template #body="props">
                    <Tag v-if="props.data.sketch" value="done" severity="success" />
                    <Tag v-else value="pending" severity="warning" />
                  </template>
                </Column>
                <!-- TODO: AMR display   -->
                <Column field="amr" header="AMR">
                  <template #body="props">
                    <Tag v-if="props.data.amr" value="done" severity="success" />
                    <Tag v-else value="pending" severity="warning" />
                  </template>
                </Column>
                <Column>
                  <template #body="props">
                    <Button
                      icon="pi pi-times"
                      @click="removeUploadedFile(props.index)"
                      disabled
                      outlined
                      rounded
                      size="small"
                      severity="danger"
                    />
                  </template>
                </Column>
              </DataTable>
            </div>
            <div v-else class="flex align-items-center justify-content-center flex-column p-5">
              <i class="pi pi-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
              <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
            </div>
          </template>
        </FileUpload>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 1200px) {
  .single-project-card {
    width: 1100px;
  }
}
</style>
