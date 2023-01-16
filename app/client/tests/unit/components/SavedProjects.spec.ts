import Vuex from "vuex";
import { RootState } from "@/store/state";
import { shallowMount } from "@vue/test-utils";
import SavedProjects from "@/components/SavedProjects.vue";
import { mockRootState } from "../../mocks";

describe("SavedProjects", () => {
    const mockGetSavedProjects = jest.fn();

    const getWrapper = () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                savedProjects: [
                    { name: "project one", hash: "123abc" },
                    { name: "project two", hash: "456def" }
                ]
            }),
            actions: {
                getSavedProjects: mockGetSavedProjects
            }
        });
        return shallowMount(SavedProjects, {
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("h4").text()).toBe("Load a previously saved project");
        const headers = wrapper.findAll(".saved-project-headers div");
        expect(headers.length).toBe(1);
        expect(headers.at(0)!.text()).toBe("Project name");
        const projectRows = wrapper.findAll(".saved-project-row");
        expect(projectRows.length).toBe(2);
        expect(projectRows.at(0)!.find("div").text()).toBe("project one");
        expect(projectRows.at(1)!.find("div").text()).toBe("project two");
    });

    it("dispatches getSavedProjects on load", () => {
        getWrapper();
        expect(mockGetSavedProjects).toHaveBeenCalledTimes(1);
    });
});
