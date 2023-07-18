import Vuex from "vuex";
import { shallowMount } from "@vue/test-utils";
import { RootState } from "@/store/state";
import LoadingProject from "@/components/projects/LoadingProject.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { mockRootState } from "../../mocks";

describe("LoadingProject", () => {
    const store = new Vuex.Store<RootState>({
        state: mockRootState({
            loadingProjectMessages: ["msg1", "msg2"]
        })
    });

    const getWrapper = () => shallowMount(LoadingProject, {
        global: {
            plugins: [store]
        }

    });

    test("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
        const divs = wrapper.findAll("div");
        expect(divs.length).toBe(3);
        expect(divs[0].text()).toBe("Loading project...");
        expect(divs[1].text()).toBe("msg1");
        expect(divs[2].text()).toBe("msg2");
    });
});
