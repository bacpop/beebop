<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

const props = defineProps<{
  isMicroReactDialogVisible: boolean;
  hasMicroReactError: boolean;
  isFetchingMicroreactUrl: boolean;
  header: string;
  text: string;
}>();
defineEmits<{
  closeDialog: [];
  saveMicroreactToken: [value: string];
}>();
const userStore = useUserStore();
const { microreactToken } = storeToRefs(userStore);
const tokenInput = ref(microreactToken.value || "");

watch(microreactToken, async (newVal) => {
  tokenInput.value = newVal || "";
});
</script>

<template>
  <Dialog
    :visible="isMicroReactDialogVisible"
    @update:visible="$emit('closeDialog')"
    modal
    :draggable="false"
    :header="props.header"
    :style="{ width: '30rem' }"
    :class="{ 'border-red-500': hasMicroReactError }"
  >
    <div class="flex flex-column gap-2 p-text-secondary block mb-4">
      <div>{{ props.text }}</div>
      <div>
        You can find your token in your
        <a
          class="text-primary no-underline hover:underline font-semibold"
          href="https://microreact.org/my-account/settings"
          target="_blank"
        >
          Microreact Account Settings</a
        >.
      </div>
    </div>
    <div class="flex flex-column gap-2 mb-3">
      <label for="microreact-token-input" class="font-medium">Token</label>
      <InputText
        v-model="tokenInput"
        id="microreact-token-input"
        class="flex-auto"
        autocomplete="off"
        :invalid="hasMicroReactError"
        aria-errormessage="token-error"
        placeholder="Enter token..."
        required
      />
      <small v-if="hasMicroReactError" id="token-error" class="text-red-500"
        >An error occurred. Please ensure the token is correct and try again.</small
      >
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="$emit('closeDialog')"></Button>
      <Button
        type="button"
        label="Save"
        :disabled="!tokenInput"
        :loading="isFetchingMicroreactUrl"
        @click="$emit('saveMicroreactToken', tokenInput)"
      ></Button>
    </div>
  </Dialog>
</template>
