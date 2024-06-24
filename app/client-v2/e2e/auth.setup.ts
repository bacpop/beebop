import { getApiUrl } from "../src/config.js";
import { test as setup } from "@playwright/test";
const authFile = "./.auth/user.json";

setup("authenticate", async ({ request }) => {
  await request.post(`${getApiUrl()}/login/mock`);
  await request.storageState({ path: authFile });
});
