<script setup lang="ts">
import { getApiUrl } from "@/config";
import { useFetch, useDateFormat } from "@vueuse/core";
import { ref } from "vue";
import InputGroup from "primevue/inputgroup";
import ConfirmDialog from "primevue/confirmdialog";
import { FilterMatchMode } from "primevue/api";
import type { DataTableRowEditSaveEvent } from "primevue/datatable";
import type { ProjectsResponse } from "@/types/projectTypes";
import DeleteProjectButton from "@/components/HomeView/DeleteProjectButton.vue";
import Toast from "primevue/toast";
import { useRouter } from "vue-router";
import { useToastService } from "@/composables/useToastService";
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const router = useRouter();
const { showErrorToast, showSuccessToast } = useToastService();

const apiUrl = getApiUrl();
const {
  data: projects,
  error: projectsError,
  isFetching,
  execute: refetchProjects
} = useFetch(apiUrl + "/projects", { credentials: "include" }).json<ProjectsResponse>();

const filters = ref({
  name: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const newProjectName = ref("");
const isEmptyOrSameName = (projectName: string) =>
  !projectName.trim() || projects.value?.data.some((project) => project.name === projectName);

const addProject = async () => {
  if (isEmptyOrSameName(newProjectName.value)) {
    showErrorToast("Project name already exists or is empty");
    return;
  }

  const { error, data: project } = await useFetch(apiUrl + "/project", {
    credentials: "include"
  })
    .post({ name: newProjectName.value })
    .json();

  if (error.value) {
    showErrorToast("Error creating project");
    return;
  }
  router.push(`/project/${project.value?.data}`);
};

const editingRows = ref([]);
const onRowEditSave = async (event: DataTableRowEditSaveEvent) => {
  let { newData, index } = event;

  if (projects.value === null || isEmptyOrSameName(newData.name)) {
    showErrorToast("Project name already exists or is empty");
    return;
  }

  const { error } = await useFetch(apiUrl + `/project/${projects.value.data[index].id}/rename`, {
    credentials: "include"
  })
    .post({ name: newData.name })
    .json();
  if (error.value) {
    showErrorToast("Error renaming project");
    return;
  }

  showSuccessToast("Project renamed");
  refetchProjects();
};
</script>

<template>
  <div class="home-page">
    <ConfirmDialog />
    <Toast />
    <div class="flex flex-column gap-1 mb-3">
      <span class="text-3xl font-bold">Projects</span>
      <span class="text-color-secondary">View and navigate to existing projects or create new ones</span>
    </div>

    <div class="surface-card p-4 shadow-2 border-round">
      <DataTable
        class="flex-grow-1"
        :value="projects?.data"
        v-model:filters="filters"
        :pt="{
          header: { style: 'padding: 0.75rem 0rem' },
          column: {
            bodycell: ({ state }: Record<string, any>) => ({
              style: state['d_editing'] && 'padding-top: 0.45rem; padding-bottom: 0.45rem;'
            })
          }
        }"
        paginator
        removableSort
        v-model:editingRows="editingRows"
        editMode="row"
        @row-edit-save="onRowEditSave"
        :loading="isFetching"
        :rows="30"
      >
        <template #header>
          <div class="flex flex-wrap align-items-center justify-content-between gap-2">
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters.name.value" placeholder="Search project by name" />
              <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Clear"
                outlined
                class="ml-2"
                v-if="filters.name.value"
                @click="filters.name.value = null"
              />
            </span>
            <div>
              <InputGroup>
                <InputText placeholder="Create new Project" v-model="newProjectName" @keydown.enter="addProject" />
                <Button aria-label="New project" icon="pi pi-plus-circle" @click="addProject" />
              </InputGroup>
            </div>
          </div>
        </template>
        <template #empty>
          <div v-if="projectsError" class="text-red-500 text-center font-semibold">
            Error fetching projects... Refresh or try again later
          </div>
          <div v-else class="text-center">No projects found.</div>
        </template>
        <template #loading>
          <ProgressSpinner strokeWidth="8" class="w-4rem h-4rem" animationDuration=".5s" />
          />
        </template>
        <Column field="name" header="Name" sortable class="w-2">
          <template #body="{ data }">
            <RouterLink :to="`/project/${data.id}`" class="text-primary no-underline hover:underline font-semibold">
              {{ data.name }}
            </RouterLink>
          </template>
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" class="w-full" />
          </template>
        </Column>
        <Column :rowEditor="true" bodyStyle="text-align:center" class="w-1"></Column>
        <Column field="samplesCount" header="# Samples" sortable class="w-3"></Column>
        <!-- todo update to date modified -->
        <Column field="timestamp" header="Date Created" sortable class="w-3">
          <template #body="{ data }">
            {{ useDateFormat(data.timestamp, "DD/MM/YYYY HH:mm").value }}
          </template>
        </Column>
        <Column class="w-1">
          <template #body="{ data }">
            <DeleteProjectButton
              :project-id="data.id"
              :project-name="data.name"
              :confirm="confirm"
              :showErrorToast="showErrorToast"
              :showSuccessToast="showSuccessToast"
              @deleted="refetchProjects"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 1200px) {
  .home-page {
    min-width: 1200px;
  }
}
</style>
