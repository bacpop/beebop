<script setup lang="ts">
import { getApiUrl } from "@/config";
import { useFetch } from "@vueuse/core";
import Toast from "primevue/toast";
import { useToastService } from "@/composables/useToastService";
import type { ConfirmationOptions } from 'primevue/confirmationoptions';

const { showErrorToast, showSuccessToast } = useToastService();

const props = defineProps<({
  projectId: string,
  projectName: string,
  confirm: {
    require: (option: ConfirmationOptions) => void;
    close: () => void;
  };
})>();

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
}

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
        showErrorToast("Deletion failed due to an error");
      } else {
        emit('deleted');
        showSuccessToast("Project deleted");
      }
    }
  });
};
</script>

<template>
  <Toast />
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

