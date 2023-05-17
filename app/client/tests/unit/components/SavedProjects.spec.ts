import Vuex from "vuex";
import { RootState } from "@/store/state";
import { shallowMount } from "@vue/test-utils";
import { mockRootState } from "../../mocks";
const mockRouter = {
    push: jest.fn()
};
jest.mock("vue-router", () => ({
    useRouter: jest.fn(() => mockRouter)
}));

const savedProjects = [
    { name: "project one", hash: "123abc", id: "ABC-123" },
    { name: "project two", hash: "456def", id: "DEF-123" }
];
// We need to import SavedProjects after mocking the router
// eslint-disable-next-line import/order
import SavedProjects from "@/components/SavedProjects.vue";

describe("SavedProjects", () => {
    const mockGetSavedProjects = jest.fn();
    const mockLoadProject = jest.fn();


    const getWrapper = () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                savedProjects
            }),
            actions: {
                getSavedProjects: mockGetSavedProjects,
                loadProject: mockLoadProject
            }
        });
        return shallowMount(SavedProjects, {
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
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

    const expectFirstProjectLoaded = () => {
        expect(mockLoadProject).toBeCalledTimes(1);
        expect(mockLoadProject.mock.calls[0][1]).toStrictEqual(savedProjects[0]);
        expect(mockRouter.push).toBeCalledTimes(1);
        expect(mockRouter.push.mock.calls[0][0]).toBe("/project");
    };

    it("dispatches loadProject and pushes project route on click", async () => {
        const wrapper = getWrapper();
        const loadProjectButton = wrapper.find(".saved-project-row button");
        await loadProjectButton.trigger("click");
        expectFirstProjectLoaded();
    });

    it("dispatches loadProject and pushes project route on Enter", async () => {
        const wrapper = getWrapper();
        const loadProjectButton = wrapper.find(".saved-project-row button");
        await loadProjectButton.trigger("keydown.enter");
        expectFirstProjectLoaded();
    });
    it("does nothing on non-Enter key down on project name", async () => {
        const wrapper = getWrapper();
        const loadProjectButton = wrapper.find(".saved-project-row button");
        await loadProjectButton.trigger("keydown.down");
        expect(mockLoadProject).not.toHaveBeenCalled();
        expect(mockRouter).not.toHaveBeenCalled();
    });
});
