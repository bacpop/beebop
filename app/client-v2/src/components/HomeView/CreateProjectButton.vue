<script setup lang="ts">
import { useToastService } from "@/composables/useToastService";
import { getApiUrl } from "@/config";
import { SPECIES, type ProjectOverview } from "@/types/projectTypes";
import { useFetch } from "@vueuse/core";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  projects: ProjectOverview[];
}>();

const { showErrorToast } = useToastService();
const router = useRouter();
const apiUrl = getApiUrl();
const visible = ref(false);
const species = ref(null);
const name = ref("");
const errors = reactive({
  name: "",
  species: "",
  creation: ""
});

const isDuplicateName = (name: string) => props.projects.some((project) => project.name === name);

const closeDialog = () => {
  visible.value = false;
  species.value = null;
  errors.name = errors.species = errors.creation = name.value = "";
};
const validateInputs = () => {
  errors.species = species.value ? "" : "Species is required";
  errors.name = name.value ? "" : "Name is required";

  if (isDuplicateName(name.value)) {
    errors.name = "Name already exists";
  }

  return !errors.species && !errors.name;
};

const createProject = async () => {
  if (!validateInputs()) {
    return;
  }

  const { error, data: project } = await useFetch(apiUrl + "/project", {
    credentials: "include"
  })
    .post({ name: name.value, species: species.value })
    .json();

  if (error.value) {
    errors.creation = "Error creating project";
    showErrorToast(errors.creation);
    return;
  }

  closeDialog();
  router.push(`/project/${project.value?.data}`);
};
</script>

<template>
  <Button label="Create project" @click="visible = true" icon="pi pi-plus" />
  <Dialog
    v-model:visible="visible"
    @update:visible="closeDialog"
    :draggable="false"
    modal
    header="Create Project"
    :style="{ width: '25rem' }"
    :class="{ 'border-red-500': errors.creation }"
  >
    <div class="mb-4 p-text-secondary">Create new project for a given species</div>
    <div class="flex flex-column gap-2 mb-4">
      <label for="species" class="font-semibold">Species</label>
      <Dropdown v-model="species" :options="SPECIES" placeholder="Select a Species" class="w-full" />
      <small v-if="!!errors.species" id="species-error" class="text-red-500">{{ errors.species }}</small>
    </div>
    <div class="flex flex-column gap-2 mb-4">
      <label for="name" class="font-semibold">Name</label>
      <InputText id="name" class="w-full" autocomplete="off" v-model="name" @keydown.enter="createProject" />
      <small v-if="!!errors.name" id="name-error" class="text-red-500">{{ errors.name }}</small>
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="closeDialog"></Button>
      <Button type="button" label="Create" @click="createProject"></Button>
    </div>
  </Dialog>
</template>
