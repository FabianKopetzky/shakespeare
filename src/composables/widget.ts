import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";

export function useWidget() {
    const toast = useToast();
    function displayError(error: string): void {
        toast.add({
            title: error,
            icon: "material-symbols:error",
            color: "error",
            duration: 2000,
        });
    }

    function displaySuccess(message: string): void {
        toast.add({
            title: message,
            icon: "mdi:success",
            color: "success",
            duration: 2000,
        });
    }

    return { displayError, displaySuccess };
}