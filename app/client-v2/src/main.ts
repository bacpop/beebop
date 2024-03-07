import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import router from "./router";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import Ripple from "primevue/ripple";
import ToastService from "primevue/toastservice";
import "./assets/main.css";
import Tooltip from "primevue/tooltip";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, { ripple: true });
app.directive("ripple", Ripple);
app.directive("tooltip", Tooltip);
app.use(ToastService);
app.mount("#app");
