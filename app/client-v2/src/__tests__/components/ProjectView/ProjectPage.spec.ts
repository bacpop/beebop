import ProjectPageVue from "@/components/ProjectView/ProjectPage.vue";
import { useProjectStore } from "@/stores/projectStore";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent } from "vue";

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
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              project: {
                basicInfo: {
                  name: "Test Project"
                },
                isRun: true
              }
            }
          })
        ],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });
    const store = useProjectStore();

    await flushPromises();

    expect(wrapper.text()).toContain("Test Project");
    expect(wrapper.text()).toContain("project has ran");
    expect(store.getProject).toHaveBeenCalled();
  });

  it("should render not run project component if is not run", async () => {
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              project: {
                basicInfo: {
                  name: "Test Project"
                },
                isRun: false
              }
            }
          })
        ],
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
    store.getProject = vitest.fn().mockResolvedValue("error fetching projects");
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [testPinia],
        stubs: {
          ProjectPostRun: stubRunProject,
          ProjectPreRun: stubNotRunProject
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Error fetching project");
  });
  it("should render completed tag if project is complete", async () => {
    const testPinia = createTestingPinia();
    const store = useProjectStore(testPinia);
    // @ts-expect-error: getter is read-only
    store.isProjectComplete = true;
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [testPinia],
        stubs: {
          RunProject: stubRunProject,
          NotRunProject: stubNotRunProject
        }
      }
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Completed");
  });
  it("should call stopPollingStatus on unmount", async () => {
    const wrapper = mount(AsyncProjectPage, {
      global: {
        plugins: [createTestingPinia()]
      },
      stubs: {
        RunProject: stubRunProject,
        NotRunProject: stubNotRunProject
      }
    });
    const store = useProjectStore();

    await flushPromises();
    wrapper.unmount();

    expect(store.stopPollingStatus).toHaveBeenCalled();
  });
});
