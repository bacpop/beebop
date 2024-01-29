/* eslint-disable import/first */
import EditProjectName from "@/components/projects/EditProjectName.vue";

const { toLocaleString } = Date.prototype;
// eslint-disable-next-line no-extend-native, func-names
Date.prototype.toLocaleString = function (locale: any = undefined, ...args: any) {
    const options = args[0];
    return toLocaleString.call(this, "en-GB", { ...options, timeZone: "UTC" });
};

import Vuex from "vuex";
import { RootState } from "@/store/state";
import { mount } from "@vue/test-utils";
import { mockRootState } from "../../mocks";
// We need to import SavedProjects after mocking the router
// eslint-disable-next-line import/order
import SavedProjects from "@/components/projects/SavedProjects.vue";

const mockRouter = {
    push: jest.fn()
};
jest.mock("vue-router", () => ({
    useRouter: jest.fn(() => mockRouter)
}));

const savedProjects = [
    {
        name: "project one", hash: "123abc", id: "ABC-123", timestamp: 1687879913811, samplesCount: 2
    },
    {
        name: "project two", hash: "456def", id: "DEF-123", timestamp: 1687879927224, samplesCount: 3
    }
];

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
        return mount(SavedProjects, {
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
        expect(headers.length).toBe(3);
        expect(headers.at(0)!.text()).toBe("Project name");
        expect(headers.at(1)!.text()).toBe("Samples");
        expect(headers.at(2)!.text()).toBe("Date");
        const projectRows = wrapper.findAll(".saved-project-row");
        expect(projectRows.length).toBe(2);
        expect(projectRows.at(0)!.find(".saved-project-name").text()).toBe("project one");
        expect(projectRows.at(0)!.find(".saved-project-samples-count").text()).toBe("2");
        expect(projectRows.at(0)!.findComponent(EditProjectName).props()).toStrictEqual({
            projectId: "ABC-123",
            projectName: "project one",
            buttonClass: "btn-sm"
        });
        expect(projectRows.at(0)!.find(".saved-project-date").text()).toBe("27/06/2023 15:31");
        expect(projectRows.at(1)!.find(".saved-project-name").text()).toBe("project two");
        expect(projectRows.at(1)!.find(".saved-project-samples-count").text()).toBe("3");
        expect(projectRows.at(1)!.findComponent(EditProjectName).props()).toStrictEqual({
            projectId: "DEF-123",
            projectName: "project two",
            buttonClass: "btn-sm"
        });
        expect(projectRows.at(1)!.find(".saved-project-date").text()).toBe("27/06/2023 15:32");
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
        expect(mockRouter.push).not.toHaveBeenCalled();
    });
});
