import { projectIndexUri } from "@/mocks/handlers/projectHandlers";
import { MOCK_PROJECTS, MOCK_SPECIES_CONFIG } from "@/mocks/mockObjects";
import { server } from "@/mocks/server";
import HomeViewVue from "@/views/HomeView.vue";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@testing-library/vue";
import { flushPromises } from "@vue/test-utils";
import { useDateFormat } from "@vueuse/core";
import { HttpResponse, http } from "msw";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import Ripple from "primevue/ripple";
import ToastService from "primevue/toastservice";
import { defineComponent } from "vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeViewVue },
    { path: "/project/:id", component: defineComponent({ template: `<div>project page</div>` }) }
  ]
});
const stubCreateProjectButton = defineComponent({
  template: '<button role="button">create project</button>'
});

const renderComponent = () => {
  render(HomeViewVue, {
    global: {
      plugins: [router, PrimeVue, ToastService, ConfirmationService],
      directives: { ripple: Ripple },
      stubs: {
        CreateProjectButton: stubCreateProjectButton
      }
    }
  });
};

describe("HomeView ", () => {
  it("should render projects with links to each project on initial render", async () => {
    const mockSpecies = Object.keys(MOCK_SPECIES_CONFIG);
    renderComponent();

    await waitFor(() => {
      MOCK_PROJECTS.forEach((project) => {
        expect(screen.getByRole("link", { name: project.name })).toHaveAttribute("href", `/project/${project.id}`);
        expect(screen.getByText(project.samplesCount)).toBeVisible();
        expect(screen.getByText(useDateFormat(project.timestamp, "DD/MM/YYYY HH:mm").value)).toBeVisible();
        expect(screen.getByRole("button", { name: new RegExp(`delete ${project.name}`, "i") })).toBeVisible();
      });
    });
    expect(screen.getAllByText(mockSpecies[0]).length).toBe(2);
    expect(screen.getAllByText(mockSpecies[1]).length).toBe(1);
  });
  it("should render create project button", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create project/i })).toBeVisible();
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
    await userEvent.type(searchInput, "Test");

    await waitFor(() => {
      expect(screen.getByRole("link", { name: MOCK_PROJECTS[0].name })).toBeVisible();
      expect(screen.queryByRole("link", { name: MOCK_PROJECTS[1].name })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: MOCK_PROJECTS[2].name })).not.toBeInTheDocument();
    });
  });

  it("should be able to edit name of project", async () => {
    renderComponent();

    const firstNameCell = await screen.findByRole("cell", {
      name: MOCK_PROJECTS[0].name
    });
    const firstEditButton = screen.getAllByRole("button", { name: /edit/i })[0];

    await userEvent.click(firstEditButton);

    await userEvent.type(within(firstNameCell).getByRole("textbox"), "New Name");

    await userEvent.click(
      screen.getByRole("button", {
        name: /save edit/i
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/Project renamed/i)).toBeVisible();
    });
  });

  it("should show error message if renamed project name is empty or exists", async () => {
    renderComponent();

    const firstNameCell = await screen.findByRole("cell", {
      name: MOCK_PROJECTS[0].name
    });
    const firstEditButton = screen.getAllByRole("button", { name: /edit/i })[0];

    await userEvent.click(firstEditButton);

    await userEvent.clear(within(firstNameCell).getByRole("textbox"));

    await userEvent.click(
      screen.getByRole("button", {
        name: /save edit/i
      })
    );
    expect(screen.getByText(/error/i)).toBeVisible();

    await userEvent.click(firstEditButton);

    await userEvent.clear(within(firstNameCell).getByRole("textbox"));
    await userEvent.type(within(firstNameCell).getByRole("textbox"), MOCK_PROJECTS[1].name);

    await userEvent.click(
      screen.getByRole("button", {
        name: /save edit/i
      })
    );
    expect(screen.getAllByText(/error/i).length).toBe(2);
  });
  it("should show error message when project rename fails", async () => {
    server.use(http.post(`${projectIndexUri}/:id/rename`, () => HttpResponse.error()));
    renderComponent();

    const firstNameCell = await screen.findByRole("cell", {
      name: MOCK_PROJECTS[0].name
    });
    const firstEditButton = screen.getAllByRole("button", { name: /edit/i })[0];

    await userEvent.click(firstEditButton);

    await userEvent.type(within(firstNameCell).getByRole("textbox"), "New Name");

    await userEvent.click(
      screen.getByRole("button", {
        name: /save edit/i
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/Error renaming project/i)).toBeVisible();
    });
  });

  // Since the Confirm and Toast components live in the HomeView component, we have to check their behavior in the context of the HomeView.
  // Those components have to live in the HomeView component because we need to have only one of them in the page.
  describe("Deleting projects", () => {
    it("should reload the list of projects after DeleteProjectButton is clicked and deletion is confirmed", async () => {
      const fetchSpy = vi.spyOn(window, "fetch");
      renderComponent();

      await waitFor(() => {
        MOCK_PROJECTS.forEach((project) => {
          expect(screen.getByRole("link", { name: project.name })).toHaveAttribute("href", `/project/${project.id}`);
        });
      });

      const firstDeleteButton = await screen.getByRole("button", {
        name: new RegExp(`delete ${MOCK_PROJECTS[0].name}`, "i")
      });
      await userEvent.click(firstDeleteButton);

      // Mock a different response to 'get' (and, later, assert that this different set of projects is listed) to verify that get is called a second time
      server.use(
        http.get(`${projectIndexUri}s`, () => {
          return HttpResponse.json({ data: MOCK_PROJECTS.slice(1), errors: [], status: "success" });
        })
      );

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the project/i)).toBeVisible();
      });

      const confirmDeleteButton = await screen.getByRole("button", { name: "Delete project" });
      await userEvent.click(confirmDeleteButton);

      await waitFor(() => {
        MOCK_PROJECTS.slice(1).forEach((project) => {
          expect(screen.getByText(project.name)).toBeVisible();
        });
        expect(screen.queryByText(MOCK_PROJECTS[0].name)).not.toBeInTheDocument();
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${projectIndexUri}/${MOCK_PROJECTS[0].id}/delete`,
        expect.objectContaining({ credentials: "include" })
      );

      await waitFor(() => {
        expect(screen.getByText(/Project deleted/i)).toBeVisible();
      });
    });

    it("should show error message when the deletion fails", async () => {
      const fetchSpy = vi.spyOn(window, "fetch");
      renderComponent();

      server.use(
        http.delete(`${projectIndexUri}/:id/delete`, () => {
          return HttpResponse.error();
        })
      );

      await screen.findByRole("cell", {
        name: MOCK_PROJECTS[0].name
      });

      const firstDeleteButton = await screen.getByRole("button", {
        name: new RegExp(`delete ${MOCK_PROJECTS[0].name}`, "i")
      });
      await userEvent.click(firstDeleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete the project/i)).toBeVisible();
      });

      const confirmDeleteButton = await screen.getByRole("button", { name: "Delete project" });
      await userEvent.click(confirmDeleteButton);

      expect(fetchSpy).toHaveBeenCalledWith(
        `${projectIndexUri}/${MOCK_PROJECTS[0].id}/delete`,
        expect.objectContaining({ credentials: "include" })
      );

      await waitFor(() => {
        expect(screen.getByText(/Deletion failed due to an error/i)).toBeVisible();
      });
    });

    describe("When the user cancels the deletion", () => {
      it("doesn't delete the project", async () => {
        const fetchSpy = vi.spyOn(window, "fetch");
        renderComponent();

        await screen.findByRole("cell", {
          name: MOCK_PROJECTS[0].name
        });

        const firstDeleteButton = await screen.getByRole("button", {
          name: new RegExp(`delete ${MOCK_PROJECTS[0].name}`, "i")
        });
        await userEvent.click(firstDeleteButton);

        await waitFor(() => {
          expect(screen.getByText(/Are you sure you want to delete the project/i)).toBeVisible();
        });

        const rejectDeleteButton = await screen.getByRole("button", { name: "Cancel" });
        await userEvent.click(rejectDeleteButton);

        expect(fetchSpy).not.toHaveBeenCalledWith(
          `${projectIndexUri}/${MOCK_PROJECTS[0].id}/delete`,
          expect.objectContaining({ credentials: "include" })
        );

        await waitFor(() => {
          expect(screen.getByText(MOCK_PROJECTS[0].name)).toBeVisible();
        });
      });
    });
  });
});
