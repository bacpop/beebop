<script setup lang="ts">
import { getApiUrl } from "@/config";
import { useFetch } from "@vueuse/core";
import type { ConfirmationOptions } from "primevue/confirmationoptions";

const props = defineProps<{
  projectId: string;
  projectName: string;
  confirm: {
    require: (option: ConfirmationOptions) => void;
    close: () => void;
  };
  showErrorToast: (msg: string) => void;
  showSuccessToast: (msg: string) => void;
}>();

const emit = defineEmits<{
  deleted: [];
}>();

const apiUrl = getApiUrl();

const doDeleteProject = async () => {
  return await useFetch(`${apiUrl}/project/${props.projectId}/delete`, {
    credentials: "include"
  })
    .delete()
    .json();
};

const confirmDeleteProject = async () => {
  props.confirm.require({
    message: `Are you sure you want to delete the project '${props.projectName}'?`,
    header: props.projectName,
    icon: "pi pi-exclamation-triangle",
    rejectLabel: "Cancel",
    acceptLabel: "Delete project",
    rejectClass: "p-button-secondary p-button-outlined",
    acceptClass: "p-button-danger",
    accept: async () => {
      const { error } = await doDeleteProject();

      if (error.value) {
        props.showErrorToast("Deletion failed due to an error");
      } else {
        emit("deleted");
        props.showSuccessToast("Project deleted");
      }
    }
  });
};
</script>

<template>
  <Button
    icon="pi pi-times"
    @click="confirmDeleteProject"
    outlined
    rounded
    size="small"
    severity="danger"
    role="button"
    :aria-label="`delete ${props.projectName}`"
  />
</template>
