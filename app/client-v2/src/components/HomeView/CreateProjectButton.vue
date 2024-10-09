<script setup lang="ts">
import { useToastService } from "@/composables/useToastService";
import { getApiUrl } from "@/config";
import { useSpeciesStore } from "@/stores/speciesStore";
import { type ProjectOverview } from "@/types/projectTypes";
import { useFetch } from "@vueuse/core";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  projects: ProjectOverview[];
}>();
const initialFormState = {
  name: "",
  species: null,
  errors: {
    name: "",
    species: "",
    creation: ""
  }
};
const form = reactive(structuredClone(initialFormState));
const { showErrorToast } = useToastService();
const speciesStore = useSpeciesStore();
const router = useRouter();
const apiUrl = getApiUrl();
const visible = ref(false);

const isDuplicateName = (name: string) => props.projects.some((project) => project.name === name);

const closeDialog = () => {
  visible.value = false;
  Object.assign(form, structuredClone(initialFormState));
};
const validateInputs = () => {
  form.errors.species = form.species ? "" : "Species is required";
  form.errors.name = form.name ? "" : "Name is required";

  if (isDuplicateName(form.name)) {
    form.errors.name = "Name already exists";
  }

  return !form.errors.species && !form.errors.name;
};

const createProject = async () => {
  if (!validateInputs()) {
    return;
  }

  const { error, data: project } = await useFetch(apiUrl + "/project", {
    credentials: "include"
  })
    .post({ name: form.name, species: form.species })
    .json();

  if (error.value) {
    form.errors.creation = "Error creating project";
    showErrorToast(form.errors.creation);
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
    :class="{ 'border-red-500': form.errors.creation }"
  >
    <div class="mb-4 p-text-secondary">Create new project for a given species</div>
    <div class="flex flex-column gap-2 mb-4">
      <label for="species" class="font-semibold">Species</label>
      <Dropdown v-model="form.species" :options="speciesStore.species" placeholder="Select a species" class="w-full" />
      <small v-if="!!form.errors.species" id="species-error" class="text-red-500">{{ form.errors.species }}</small>
    </div>
    <div class="flex flex-column gap-2 mb-4">
      <label for="name" class="font-semibold">Name</label>
      <InputText id="name" class="w-full" autocomplete="off" v-model="form.name" @keydown.enter="createProject" />
      <small v-if="!!form.errors.name" id="name-error" class="text-red-500">{{ form.errors.name }}</small>
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="closeDialog"></Button>
      <Button type="button" label="Create" @click="createProject"></Button>
    </div>
  </Dialog>
</template>
