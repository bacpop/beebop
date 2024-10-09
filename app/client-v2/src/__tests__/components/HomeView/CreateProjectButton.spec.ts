import { render, screen, waitFor } from "@testing-library/vue";
import CreateProjectButton from "@/components/HomeView/CreateProjectButton.vue";
import { createRouter, createWebHistory } from "vue-router";
import { defineComponent } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { MOCK_PROJECTS, MOCK_SPECIES } from "@/mocks/mockObjects";
import userEvent from "@testing-library/user-event";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";
import { projectIndexUri } from "@/mocks/handlers/projectHandlers";
import { createTestingPinia } from "@pinia/testing";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: CreateProjectButton },
    { path: "/project/:id", component: defineComponent({ template: `<div>project page</div>` }) }
  ]
});
const renderComponent = () => {
  render(CreateProjectButton, {
    global: {
      plugins: [
        router,
        PrimeVue,
        ToastService,
        createTestingPinia({
          initialState: {
            species: {
              species: MOCK_SPECIES
            }
          }
        })
      ]
    },
    props: {
      projects: MOCK_PROJECTS
    }
  });
};
describe("CreateProject Button component", () => {
  it("open modal on create project button click", async () => {
    renderComponent();

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));

    expect(screen.getByText("Create new project for a given species")).toBeVisible();
  });

  it("should navigate project page on successful project creation", async () => {
    const push = vitest.spyOn(router, "push");
    renderComponent();

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("textbox"), "new project name");
    await userEvent.click(screen.getByRole("option", { name: MOCK_PROJECTS[0].species }));

    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(`/project/${MOCK_PROJECTS[0].id}`);
    });
  });

  it("should error if no name or species is selected", async () => {
    renderComponent();

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));
    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Name is required")).toBeVisible();
    expect(screen.getByText("Species is required")).toBeVisible();
  });

  it("should error if duplicate name is created", async () => {
    renderComponent();

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("textbox"), MOCK_PROJECTS[0].name);
    await userEvent.click(screen.getByRole("option", { name: MOCK_PROJECTS[0].species }));

    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Name already exists")).toBeVisible();
  });

  it("should not push router if server error on submit", async () => {
    const push = vitest.spyOn(router, "push");
    server.use(http.post(projectIndexUri, () => HttpResponse.error()));
    renderComponent();

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("textbox"), "new project name");
    await userEvent.click(screen.getByRole("option", { name: MOCK_PROJECTS[0].species }));

    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(push).not.toHaveBeenCalled;
    });
  });

  it("should get rid of error messages on modal close", async () => {
    renderComponent();

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));
    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Name is required")).toBeVisible();
    expect(screen.getByText("Species is required")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));

    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    expect(screen.queryByText("Species is required")).not.toBeInTheDocument();
  });

  it("should get rid of input fields on cancel button click", async () => {
    renderComponent();

    await userEvent.click(screen.getByRole("button", { name: /create project/i }));
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByRole("textbox"), "new project name");
    await userEvent.click(screen.getByRole("option", { name: MOCK_PROJECTS[0].species }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument;
  });
});
