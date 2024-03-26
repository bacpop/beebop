import ProjectViewVue from "@/views/ProjectView.vue";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

describe("ProjectView", () => {
  const stubProject = defineComponent({
    async setup() {
      return {};
    },
    template: "<div>project view</div>"
  });

  it("should render progress spinner until main data is loaded", async () => {
    const wrapper = mount(ProjectViewVue, {
      global: {
        stubs: {
          Project: stubProject
        }
      }
    });

    expect(wrapper.find("[role=progressbar]").exists()).toBe(true);

    await flushPromises();

    expect(wrapper.text()).toBe("project view");
    expect(wrapper.find("[role=progressbar]").exists()).toBe(false);
  });
});
