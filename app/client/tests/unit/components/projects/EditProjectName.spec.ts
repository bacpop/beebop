import Vuex from "vuex";
import { RootState } from "@/store/state";
import { mount, VueWrapper } from "@vue/test-utils";
import EditProjectName from "@/components/projects/EditProjectName.vue";
import ProjectNameCheckMessage from "@/components/projects/ProjectNameCheckMessage.vue";
import { ProjectNameCheckResult } from "@/types";
import { getters } from "@/store/getters";
import { mockRootState } from "../../../mocks";

describe("EditProjectName", () => {
    const mockRenameProject = jest.fn();
    const getWrapper = () => {
        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                savedProjects: [
                    { id: "1", name: "existing project 1" },
                    { id: "2", name: "existing project 2" }
                ] as any
            }),
            actions: {
                renameProject: mockRenameProject
            },
            getters
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
        await wrapper.setData({
            editingProjectName: true,
            inputText: "old project name",
            checkResult: ProjectNameCheckResult.Unchanged
        });
        expect(wrapper.find("span#test-slot").exists()).toBe(false);
        expect(wrapper.find("i").exists()).toBe(false);
        expect((wrapper.find("input").element as HTMLInputElement).value).toBe("old project name");
        expect(wrapper.find("button#save-project-name").text()).toBe("Save");
        expect(wrapper.find("button#save-project-name").classes()).toContain("btn-sm");
        expect(wrapper.find("button#cancel-project-name").text()).toBe("Cancel");
        expect(wrapper.find("button#cancel-project-name").classes()).toContain("btn-sm");
        expect(wrapper.findComponent(ProjectNameCheckMessage).props("checkResult"))
            .toBe(ProjectNameCheckResult.Unchanged);
    });

    it("clicking edit icon enables editing and sets data", async () => {
        const wrapper = getWrapper();
        await wrapper.find("i.edit-icon").trigger("click");
        expect(wrapper.vm.$data.editingProjectName).toBe(true);
        expect(wrapper.find("input").exists()).toBe(true);
        expect((wrapper.find("input").element as HTMLInputElement).value).toBe("old project name");
        expect(wrapper.findComponent(ProjectNameCheckMessage).props("checkResult"))
            .toBe(ProjectNameCheckResult.Unchanged);
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

    it("changing input value updates project name check result and Save button", async () => {
        const wrapper = getWrapper();

        const expectComponentValuesForInputText = async (
            inputText: string,
            checkResult: ProjectNameCheckResult,
            saveButtonEnabled: boolean) => {
            await wrapper.find("input").setValue(inputText);
            expect(wrapper.findComponent(ProjectNameCheckMessage).props("checkResult")).toBe(checkResult);
            expect((wrapper.find("button#save-project-name").element as HTMLButtonElement).disabled)
                .toBe(!saveButtonEnabled);
        };

        await wrapper.find("i.edit-icon").trigger("click");
        await expectComponentValuesForInputText("", ProjectNameCheckResult.Empty, false);
        await expectComponentValuesForInputText("existing project 2", ProjectNameCheckResult.Duplicate, false);
        await expectComponentValuesForInputText("new name", ProjectNameCheckResult.OK, true);
        await expectComponentValuesForInputText("old project name", ProjectNameCheckResult.Unchanged, true);
    });

    it("clicking Save button does not invoke Save action if name is unchanged", async () => {
        const wrapper = getWrapper();
        await wrapper.setData({ editingProjectName: true });
        await wrapper.find("input").setValue("old project name");
        await wrapper.find("button#save-project-name").trigger("click");
        expect(mockRenameProject).not.toHaveBeenCalled();
        // stops editing
        expect(wrapper.vm.$data.editingProjectName).toBe(false);
        expect(wrapper.find("span#test-slot").exists()).toBe(true);
    });

    it("trims name on save", async () => {
        const wrapper = getWrapper();
        await wrapper.setData({ editingProjectName: true });
        await wrapper.find("input").setValue("  new project name ");
        await wrapper.find("button#save-project-name").trigger("click");
        expectSavedProject(wrapper);
    });
});
