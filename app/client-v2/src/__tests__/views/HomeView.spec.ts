import ToastService from "primevue/toastservice";
import PrimeVue from "primevue/config";
import HomeViewVue from "@/views/HomeView.vue";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/vue";
import Ripple from "primevue/ripple";
import { MOCK_PROJECTS } from "@/mocks/mockObjects";
import { createRouter, createWebHistory } from "vue-router";
import { defineComponent } from "vue";
import { useDateFormat } from "@vueuse/core";
import { server } from "@/mocks/server";
import { HttpResponse, http } from "msw";
import { projectIndexUri } from "@/mocks/handlers/projectHandlers";
import { flushPromises } from "@vue/test-utils";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeViewVue },
    { path: "/project/:id", component: defineComponent({ template: `<div>project page</div>` }) }
  ]
});
const renderComponent = () => {
  render(HomeViewVue, {
    global: {
      plugins: [router, PrimeVue, ToastService],
      directives: { ripple: Ripple }
    }
  });
};

describe("HomeView ", () => {
  it("should render projects with links to each project on initial render", async () => {
    renderComponent();

    await waitFor(() => {
      MOCK_PROJECTS.forEach((project) => {
        expect(screen.getByRole("link", { name: project.name })).toHaveAttribute("href", `/project/${project.id}`);
        expect(screen.getByText(project.samplesCount)).toBeVisible();
        expect(screen.getByText(useDateFormat(project.timestamp, "DD/MM/YYYY HH:mm").value)).toBeVisible();
      });
    });
  });
  it("should render no projects message when no projects are available", async () => {
    server.use(http.get(`${projectIndexUri}s`, () => HttpResponse.json({ data: [], errors: [], status: "success" })));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No projects found/i)).toBeVisible();
    });
  });
  it("should render error message when projects fail to load", async () => {
    server.use(http.get(`${projectIndexUri}s`, () => HttpResponse.error()));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error fetching projects/i)).toBeVisible();
    });
  });

  it("should filter projects when search input is used", async () => {
    renderComponent();

    await flushPromises();

    const searchInput = screen.getByPlaceholderText(/search/i);
    await fireEvent.update(searchInput, "Test");

    await waitFor(() => {
      expect(screen.getByRole("link", { name: MOCK_PROJECTS[0].name })).toBeVisible();
      expect(screen.queryByRole("link", { name: MOCK_PROJECTS[1].name })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: MOCK_PROJECTS[2].name })).not.toBeInTheDocument();
    });
  });
  it("should push router when new project is created with name", async () => {
    const push = vitest.spyOn(router, "push");
    renderComponent();

    const createButton = screen.getByRole("button", { name: /add-project/i });
    const createInput = screen.getByPlaceholderText(/create/i);

    await fireEvent.click(createButton);
    expect(push).not.toHaveBeenCalled();

    await fireEvent.update(createInput, "New Project");
    await fireEvent.click(createButton);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(`/project/${MOCK_PROJECTS[0].id}`);
    });
  });
  it("should show error message when new project creation fails", async () => {
    server.use(http.post(projectIndexUri, () => HttpResponse.error()));
    renderComponent();

    const createButton = screen.getByRole("button", { name: /add-project/i });
    const createInput = screen.getByPlaceholderText(/create/i);

    await fireEvent.update(createInput, "New Project");
    await fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Error creating project/i)).toBeVisible();
    });
  });

  it("should be able to edit name of project", async () => {
    renderComponent();

    const firstNameCell = await screen.findByRole("cell", {
      name: MOCK_PROJECTS[0].name
    });
    const firstEditButton = screen.getAllByRole("button", { name: /edit/i })[0];

    await fireEvent.click(firstEditButton);

    await fireEvent.update(within(firstNameCell).getByRole("textbox"), "New Name");

    await fireEvent.click(
      screen.getByRole("button", {
        name: /save edit/i
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/Project renamed successfully/i)).toBeVisible();
    });
  });
  it("should show error message when project rename fails", async () => {
    server.use(http.post(`${projectIndexUri}/:id/rename`, () => HttpResponse.error()));
    renderComponent();

    const firstNameCell = await screen.findByRole("cell", {
      name: MOCK_PROJECTS[0].name
    });
    const firstEditButton = screen.getAllByRole("button", { name: /edit/i })[0];

    await fireEvent.click(firstEditButton);

    await fireEvent.update(within(firstNameCell).getByRole("textbox"), "New Name");

    await fireEvent.click(
      screen.getByRole("button", {
        name: /save edit/i
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/Error renaming project/i)).toBeVisible();
    });
  });
});
