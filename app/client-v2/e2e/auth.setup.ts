import { test as setup } from "@playwright/test";
const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ request }) => {
  await request.get("http://localhost:4000/login/mock");
  await request.storageState({ path: authFile });
});
