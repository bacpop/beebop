import Vuex from "vuex";
import { RootState } from "@/store/state";
import {mount, VueWrapper} from "@vue/test-utils";
import EditProjectName from "@/components/projects/EditProjectName.vue";
import { mockRootState } from "../../../mocks";

describe("EditProjectName", () => {
    const mockRenameProject = jest.fn();
    const getWrapper = () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState(),
            actions: {
                renameProject: mockRenameProject
            }
        });
        return mount(EditProjectName, {
            props: {
                projectId: "testProjectId",
                projectName: "old project name",
                buttonClass: "btn-sm"
            },
            slots: {
                default: "<span id='test-slot'>not editing testProjectId</span>"
            },
            global: {
                plugins: [store]
            }
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders as expected when not editing", () => {
        const wrapper = getWrapper();
        expect(wrapper.find("span#test-slot").text()).toBe("not editing testProjectId");
        expect(wrapper.find("i").classes()).toContain("bi-pencil");
        expect(wrapper.find("input").exists()).toBe(false);
        expect(wrapper.find("button").exists()).toBe(false);
    });

    it("renders as expected when editing", async () => {
        const wrapper = getWrapper();
        await wrapper.setData({ editingProjectName: true });
        expect(wrapper.find("span#test-slot").exists()).toBe(false);
        expect(wrapper.find("i").exists()).toBe(false);
        expect((wrapper.find("input").element as HTMLInputElement).value).toBe("old project name");
        expect(wrapper.find("button#save-project-name").text()).toBe("Save");
        expect(wrapper.find("button#save-project-name").classes()).toContain("btn-sm");
        expect(wrapper.find("button#cancel-project-name").text()).toBe("Cancel");
        expect(wrapper.find("button#cancel-project-name").classes()).toContain("btn-sm");
    });

    it("clicking edit icon enables editing", async () => {
        const wrapper = getWrapper();
        await wrapper.find("i.edit-icon").trigger("click");
        expect(wrapper.vm.$data.editingProjectName).toBe(true);
        expect(wrapper.find("input").exists()).toBe(true);
        expect(wrapper.find("button#save-project-name").exists()).toBe(true);
    });

    it("clicking Cancel button stops editing", async () => {
        const wrapper = getWrapper();
        await wrapper.setData({ editingProjectName: true });
        await wrapper.find("button#cancel-project-name").trigger("click");
        expect(wrapper.vm.$data.editingProjectName).toBe(false);
        expect(wrapper.find("span#test-slot").exists()).toBe(true);
        expect(wrapper.find("i").exists()).toBe(true);
        expect(mockRenameProject).not.toHaveBeenCalled();
    });

    const expectSavedProject = (wrapper: VueWrapper<any>) => {
        expect(wrapper.vm.$data.editingProjectName).toBe(false);
        expect(wrapper.find("span#test-slot").exists()).toBe(true);
        expect(wrapper.find("i").exists()).toBe(true);
        expect(mockRenameProject).toHaveBeenCalledTimes(1);
        expect(mockRenameProject.mock.calls[0][1]).toStrictEqual({
            projectId: "testProjectId",
            name: "new project name"
        });
    };

    it("clicking Save button invokes action and stops editing", async () => {
        const wrapper = getWrapper();
        await wrapper.setData({ editingProjectName: true });
        await wrapper.find("input").setValue("new project name");
        await wrapper.find("button#save-project-name").trigger("click");
        expectSavedProject(wrapper);
    });

    it("pressing Enter invokes save action and stops editing", async () => {
        const wrapper = getWrapper();
        await wrapper.setData({ editingProjectName: true });
        await wrapper.find("input").setValue("new project name");
        await wrapper.find("input").trigger("keyup.enter");
        expectSavedProject(wrapper);
    });
});
