import { useToast } from "primevue/usetoast";

export const useToastService = () => {
  const toast = useToast();

  const showSuccessToast = (msg: string) => {
    toast.add({ severity: "success", summary: "Success", detail: msg, life: 5000 });
  };
  const showErrorToast = (msg: string) => {
    toast.add({ severity: "error", summary: "Error", detail: msg, life: 5000 });
  };
  const showInfoToast = (msg: string) => {
    toast.add({ severity: "info", summary: "Info", detail: msg, life: 5000 });
  };

  return { showSuccessToast, showErrorToast, showInfoToast };
};
