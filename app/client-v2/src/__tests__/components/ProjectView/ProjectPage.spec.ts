import ProjectPageVue from "@/components/ProjectView/ProjectPage.vue";
import { useProjectStore } from "@/stores/projectStore";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import PrimeVue from "primevue/config";

vitest.mock("primevue/usetoast", () => ({
  useToast: vitest.fn()
}));
vitest.mock("vue-router", () => ({
  useRoute: vitest.fn(() => ({
    params: {
      id: 1
    }
  })),
  useRouter: vitest.fn(() => ({
    push: () => {}
  }))
}));
const stubRunProject = defineComponent({
  template: "<div>project has ran</div>"
});
const stubNotRunProject = defineComponent({
  template: "<div>project not ran</div>"
});
const AsyncProjectPage = defineComponent({
  components: { ProjectPageVue },
  template: "<Suspense> <ProjectPageVue /> </Suspense>"
});

describe("Project Page", () => {
  it("should render project data and run project component if is run", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.project.name = "Test Project";
    // @ts-expect-error: getter is read-only
    store.hasStartedAtLeastOneRun = true;
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [PrimeVue, testPinia],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Test Project");
    expect(wrapper.text()).toContain("project has ran");
    expect(store.getProject).toHaveBeenCalled();
  });

  it("should render not run project component if is not run", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.project.name = "Test Project";
    // @ts-expect-error: getter is read-only
    store.hasStartedAtLeastOneRun = false;
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [PrimeVue, testPinia],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("project not ran");
  });
  it("should render error content if getProject throws an error", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    store.getProject = vitest.fn().mockResolvedValue("arbitrary error value");
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [PrimeVue, testPinia],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Error fetching project");
  });
  it("should render 'not found' content if getProject throws an error and the project has been deleted", async () => {
    const testPinia = createTestingPinia();

    const store = useProjectStore(testPinia);
    store.getProject = vitest.fn().mockResolvedValue({ response: { status: 404 } });

    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [PrimeVue, testPinia],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Project not found");
  });
  it("should render completed tag if project is complete", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    // @ts-expect-error: getter is read-only
    store.isFinishedRun = true;
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [PrimeVue, testPinia],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Completed");
  });
  it("should call stopPollingStatus on unmount", async () => {
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [PrimeVue, createTestingPinia()],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });
    const store = useProjectStore();

    await flushPromises();
    wrapper.unmount();

    expect(store.stopPollingStatus).toHaveBeenCalled();
  });
});
